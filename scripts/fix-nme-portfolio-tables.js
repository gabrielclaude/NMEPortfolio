/**
 * Fix NME Portfolio tables to match page expectations
 */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function fixNMEPortfolioTables() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to database');

  // Drop and recreate with correct schema
  await client.query('DROP TABLE IF EXISTS nme_frontier_curve CASCADE');
  await client.query('DROP TABLE IF EXISTS nme_portfolio_opt CASCADE');
  console.log('✓ Dropped old tables');

  // nme_portfolio_opt with all required columns
  await client.query(`
    CREATE TABLE nme_portfolio_opt (
      id SERIAL PRIMARY KEY,
      nme_id TEXT NOT NULL REFERENCES "NME"(id),
      return_score DECIMAL(8,6) NOT NULL DEFAULT 0,
      risk_score DECIMAL(8,6) NOT NULL DEFAULT 0,
      sharpe_ratio DECIMAL(8,4) NOT NULL DEFAULT 0,
      is_frontier BOOLEAN NOT NULL DEFAULT FALSE,
      optimal_weight DECIMAL(8,6) NOT NULL DEFAULT 0,
      min_var_weight DECIMAL(8,6) NOT NULL DEFAULT 0,
      tier TEXT NOT NULL DEFAULT 'EXCLUDE',
      ev_ratio DECIMAL(8,6) NOT NULL DEFAULT 0,
      evm_risk DECIMAL(8,6) NOT NULL DEFAULT 0,
      phase_risk DECIMAL(8,6) NOT NULL DEFAULT 0,
      computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(nme_id)
    )
  `);
  console.log('✓ Created nme_portfolio_opt');

  // nme_frontier_curve with correct columns
  await client.query(`
    CREATE TABLE nme_frontier_curve (
      id SERIAL PRIMARY KEY,
      portfolio_risk DECIMAL(8,6) NOT NULL,
      portfolio_return DECIMAL(8,6) NOT NULL,
      is_min_variance BOOLEAN NOT NULL DEFAULT FALSE,
      is_max_sharpe BOOLEAN NOT NULL DEFAULT FALSE,
      computed_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✓ Created nme_frontier_curve');

  // Get NME data from the view
  const nmeQuery = `
    SELECT
      nme_id,
      nme_code,
      nme_name,
      therapeutic_area,
      molecule_type,
      nme_status,
      project_count,
      task_completion_pct,
      total_ev,
      total_bac,
      portfolio_spi,
      portfolio_cpi,
      ev_ratio,
      completion_ratio,
      phase_risk,
      status_risk,
      evm_risk
    FROM v_nme_portfolio_metrics
  `;

  const { rows: nmes } = await client.query(nmeQuery);
  console.log(`Found ${nmes.length} NMEs`);

  // Compute return and risk scores
  const scored = nmes.map(n => {
    const evRatio = parseFloat(n.ev_ratio) || 0;
    const completionRatio = parseFloat(n.completion_ratio) || 0;
    const evmRisk = parseFloat(n.evm_risk) || 0;
    const phaseRisk = parseFloat(n.phase_risk) || 0;
    const statusRisk = parseFloat(n.status_risk) || 0;

    // Return = 0.5×EV/BAC + 0.3×Task% + 0.2×Phase Maturity
    const returnScore = 0.5 * evRatio + 0.3 * completionRatio + 0.2 * (1 - phaseRisk);

    // Risk = 0.5×EVM Risk + 0.3×Phase Risk + 0.2×Status Risk
    const riskScore = Math.max(0.01, 0.5 * evmRisk + 0.3 * phaseRisk + 0.2 * statusRisk);

    // Sharpe ratio (excess return / risk)
    const riskFreeRate = 0.02;
    const sharpeRatio = riskScore > 0 ? (returnScore - riskFreeRate) / riskScore : 0;

    return {
      ...n,
      return_score: returnScore,
      risk_score: riskScore,
      sharpe_ratio: sharpeRatio,
      ev_ratio: evRatio,
      evm_risk: evmRisk,
      phase_risk: phaseRisk,
    };
  });

  // Determine efficient frontier (Pareto-optimal set)
  for (const n of scored) {
    n.is_frontier = !scored.some(other =>
      other.nme_id !== n.nme_id &&
      other.return_score >= n.return_score &&
      other.risk_score <= n.risk_score &&
      (other.return_score > n.return_score || other.risk_score < n.risk_score)
    );
  }

  // Compute weights (simulate optimization)
  const totalSharpe = scored.reduce((s, n) => s + Math.max(0, n.sharpe_ratio), 0);

  for (const n of scored) {
    // Optimal weight proportional to Sharpe ratio
    n.optimal_weight = totalSharpe > 0 ? Math.max(0, n.sharpe_ratio) / totalSharpe : 1 / scored.length;

    // Min-variance weight inversely proportional to risk
    const totalInvRisk = scored.reduce((s, x) => s + 1 / Math.max(0.01, x.risk_score), 0);
    n.min_var_weight = (1 / Math.max(0.01, n.risk_score)) / totalInvRisk;
  }

  // Assign tiers based on Sharpe ratio quartiles
  const sortedBySharpe = [...scored].sort((a, b) => b.sharpe_ratio - a.sharpe_ratio);
  const q1 = Math.floor(sortedBySharpe.length * 0.25);
  const q2 = Math.floor(sortedBySharpe.length * 0.50);
  const q3 = Math.floor(sortedBySharpe.length * 0.75);

  for (let i = 0; i < sortedBySharpe.length; i++) {
    if (i < q1) sortedBySharpe[i].tier = 'CORE';
    else if (i < q2) sortedBySharpe[i].tier = 'GROWTH';
    else if (i < q3) sortedBySharpe[i].tier = 'SATELLITE';
    else sortedBySharpe[i].tier = 'EXCLUDE';
  }

  // Insert NME recommendations
  for (const n of scored) {
    await client.query(`
      INSERT INTO nme_portfolio_opt (
        nme_id, return_score, risk_score, sharpe_ratio,
        is_frontier, optimal_weight, min_var_weight,
        tier, ev_ratio, evm_risk, phase_risk, computed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    `, [
      n.nme_id,
      n.return_score.toFixed(6),
      n.risk_score.toFixed(6),
      n.sharpe_ratio.toFixed(4),
      n.is_frontier,
      n.optimal_weight.toFixed(6),
      n.min_var_weight.toFixed(6),
      n.tier,
      n.ev_ratio.toFixed(6),
      n.evm_risk.toFixed(6),
      n.phase_risk.toFixed(6),
    ]);
  }

  console.log(`✓ Inserted ${scored.length} NME recommendations`);

  // Generate frontier curve
  const frontierNMEs = scored.filter(n => n.is_frontier).sort((a, b) => a.risk_score - b.risk_score);

  if (frontierNMEs.length >= 2) {
    // Find min-variance and max-sharpe points
    const minVarIdx = 0;
    const maxSharpeIdx = frontierNMEs.reduce((best, n, i) =>
      n.sharpe_ratio > frontierNMEs[best].sharpe_ratio ? i : best, 0);

    // Generate curve points
    const curvePoints = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const minR = frontierNMEs[0].risk_score;
      const maxR = frontierNMEs[frontierNMEs.length - 1].risk_score;
      const risk = minR + t * (maxR - minR);

      // Interpolate return based on frontier shape
      let ret;
      if (i === 0) {
        ret = frontierNMEs[0].return_score;
      } else if (i === steps) {
        ret = frontierNMEs[frontierNMEs.length - 1].return_score;
      } else {
        // Find surrounding frontier points
        let lower = frontierNMEs[0];
        let upper = frontierNMEs[frontierNMEs.length - 1];
        for (const fn of frontierNMEs) {
          if (fn.risk_score <= risk && fn.risk_score > lower.risk_score) lower = fn;
          if (fn.risk_score >= risk && fn.risk_score < upper.risk_score) upper = fn;
        }
        // Linear interpolation
        if (upper.risk_score === lower.risk_score) {
          ret = lower.return_score;
        } else {
          const ratio = (risk - lower.risk_score) / (upper.risk_score - lower.risk_score);
          ret = lower.return_score + ratio * (upper.return_score - lower.return_score);
        }
      }

      curvePoints.push({
        risk,
        return: ret,
        is_min_variance: i === 0,
        is_max_sharpe: Math.abs(risk - frontierNMEs[maxSharpeIdx].risk_score) < 0.01,
      });
    }

    for (const p of curvePoints) {
      await client.query(`
        INSERT INTO nme_frontier_curve (portfolio_risk, portfolio_return, is_min_variance, is_max_sharpe, computed_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [p.risk.toFixed(6), p.return.toFixed(6), p.is_min_variance, p.is_max_sharpe]);
    }

    console.log(`✓ Inserted ${curvePoints.length} frontier curve points`);
  }

  const tierCounts = scored.reduce((acc, n) => {
    acc[n.tier] = (acc[n.tier] || 0) + 1;
    return acc;
  }, {});

  console.log('Tier distribution:', tierCounts);
  console.log(`Frontier NMEs: ${frontierNMEs.length}`);

  await client.end();
  console.log('Done');
}

fixNMEPortfolioTables().catch(console.error);
