/**
 * Compute Portfolio Optimization
 * Markowitz Efficient Frontier + Nash Equilibrium alignment
 */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function computePortfolioOpt() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to database');

  // Get project data from the view
  const projectQuery = `
    SELECT
      project_id,
      project_code,
      project_name,
      project_status,
      trial_phase,
      nme_name,
      nme_code,
      nme_id,
      therapeutic_area,
      task_completion_pct,
      bac,
      spi,
      cpi,
      ev
    FROM v_project_portfolio_base
  `;

  const { rows: projects } = await client.query(projectQuery);
  console.log(`Found ${projects.length} projects`);

  // Clear existing recommendations
  await client.query('DELETE FROM portfolio_recommendation');
  console.log('Cleared existing recommendations');

  // Compute return and risk scores
  const scored = projects.map(p => {
    const spi = parseFloat(p.spi) || 1;
    const cpi = parseFloat(p.cpi) || 1;
    const bac = parseFloat(p.bac) || 1;
    const ev = parseFloat(p.ev) || 0;

    // Return = EV / BAC (how much value earned relative to budget)
    const returnScore = Math.min(ev / bac, 1);

    // Risk = 0.5 * (1 - SPI) + 0.5 * (1 - CPI)
    const riskScore = Math.max(0, Math.min(1, 0.5 * (1 - spi) + 0.5 * (1 - cpi)));

    return {
      ...p,
      return_score: returnScore,
      risk_score: riskScore,
      spi,
      cpi,
    };
  });

  // Determine efficient frontier (Pareto-optimal set)
  // A project is on the frontier if no other project has both higher return AND lower risk
  for (const p of scored) {
    p.is_frontier = !scored.some(other =>
      other.project_id !== p.project_id &&
      other.return_score >= p.return_score &&
      other.risk_score <= p.risk_score &&
      (other.return_score > p.return_score || other.risk_score < p.risk_score)
    );
  }

  // Get task completion by role for Nash equilibrium
  const rolePayoffQuery = `
    SELECT
      p.id AS project_id,
      s.role,
      COUNT(t.id) AS total_tasks,
      COUNT(t.id) FILTER (WHERE t.status = 'DONE') AS done_tasks
    FROM "Project" p
    JOIN "Milestone" m ON m."projectId" = p.id
    JOIN "Task" t ON t."milestoneId" = m.id
    LEFT JOIN "Staff" s ON s.id = t."assigneeId"
    WHERE s.role IN ('PRINCIPAL_SCIENTIST', 'MEDICAL_MONITOR', 'REGULATORY_AFFAIRS')
    GROUP BY p.id, s.role
  `;

  const { rows: roleData } = await client.query(rolePayoffQuery);

  // Build payoff map per project per role
  const payoffMap = {};
  for (const row of roleData) {
    if (!payoffMap[row.project_id]) {
      payoffMap[row.project_id] = {};
    }
    const total = parseInt(row.total_tasks) || 1;
    const done = parseInt(row.done_tasks);
    payoffMap[row.project_id][row.role] = (done / total) * 100;
  }

  // Compute mean payoffs across all projects
  const allPayoffs = { PS: [], MM: [], RA: [] };
  const roleMap = {
    PRINCIPAL_SCIENTIST: 'PS',
    MEDICAL_MONITOR: 'MM',
    REGULATORY_AFFAIRS: 'RA',
  };

  for (const projectId of Object.keys(payoffMap)) {
    const pf = payoffMap[projectId];
    if (pf.PRINCIPAL_SCIENTIST !== undefined) allPayoffs.PS.push(pf.PRINCIPAL_SCIENTIST);
    if (pf.MEDICAL_MONITOR !== undefined) allPayoffs.MM.push(pf.MEDICAL_MONITOR);
    if (pf.REGULATORY_AFFAIRS !== undefined) allPayoffs.RA.push(pf.REGULATORY_AFFAIRS);
  }

  const meanPayoffs = {
    PS: allPayoffs.PS.length ? allPayoffs.PS.reduce((a, b) => a + b, 0) / allPayoffs.PS.length : 50,
    MM: allPayoffs.MM.length ? allPayoffs.MM.reduce((a, b) => a + b, 0) / allPayoffs.MM.length : 50,
    RA: allPayoffs.RA.length ? allPayoffs.RA.reduce((a, b) => a + b, 0) / allPayoffs.RA.length : 50,
  };

  console.log('Mean payoffs:', meanPayoffs);

  // Assign payoffs and Nash preference
  for (const p of scored) {
    const pf = payoffMap[p.project_id] || {};
    p.ps_payoff = pf.PRINCIPAL_SCIENTIST ?? 50;
    p.mm_payoff = pf.MEDICAL_MONITOR ?? 50;
    p.ra_payoff = pf.REGULATORY_AFFAIRS ?? 50;

    // Nash preferred: all roles >= their mean
    p.nash_preferred =
      p.ps_payoff >= meanPayoffs.PS &&
      p.mm_payoff >= meanPayoffs.MM &&
      p.ra_payoff >= meanPayoffs.RA;
  }

  // Compute combined score and recommendation tier
  // Score = 40% Return + 40% (1-Risk) + 20% avg Payoff
  for (const p of scored) {
    const avgPayoff = (p.ps_payoff + p.mm_payoff + p.ra_payoff) / 300; // Normalize to 0-1
    p.combined_score = 0.4 * p.return_score + 0.4 * (1 - p.risk_score) + 0.2 * avgPayoff;

    // Recommendation tier
    if (p.is_frontier && p.nash_preferred) {
      p.recommendation = 'SELECT';
    } else if (p.is_frontier || p.nash_preferred) {
      p.recommendation = 'CONSIDER';
    } else if (p.combined_score >= 0.5) {
      p.recommendation = 'MONITOR';
    } else {
      p.recommendation = 'DEFER';
    }
  }

  // Insert recommendations
  for (const p of scored) {
    await client.query(`
      INSERT INTO portfolio_recommendation (
        project_id, return_score, risk_score, spi, cpi,
        is_frontier, nash_preferred,
        ps_payoff, mm_payoff, ra_payoff,
        recommendation, combined_score, computed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    `, [
      p.project_id,
      p.return_score.toFixed(6),
      p.risk_score.toFixed(6),
      p.spi.toFixed(6),
      p.cpi.toFixed(6),
      p.is_frontier,
      p.nash_preferred,
      p.ps_payoff.toFixed(4),
      p.mm_payoff.toFixed(4),
      p.ra_payoff.toFixed(4),
      p.recommendation,
      p.combined_score.toFixed(6),
    ]);
  }

  const tierCounts = scored.reduce((acc, p) => {
    acc[p.recommendation] = (acc[p.recommendation] || 0) + 1;
    return acc;
  }, {});

  console.log(`✓ Inserted ${scored.length} portfolio recommendations`);
  console.log('Tier distribution:', tierCounts);
  await client.end();
  console.log('Done');
}

computePortfolioOpt().catch(console.error);
