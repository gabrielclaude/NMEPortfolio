/**
 * Compute NME Portfolio Optimization
 * Markowitz Efficient Frontier for NME assets
 */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function computeNMEPortfolioOpt() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to database');

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
      completion_ratio
    FROM v_nme_portfolio_metrics
  `;

  const { rows: nmes } = await client.query(nmeQuery);
  console.log(`Found ${nmes.length} NMEs`);

  // Clear existing data
  await client.query('DELETE FROM nme_portfolio_opt');
  await client.query('DELETE FROM nme_frontier_curve');
  console.log('Cleared existing NME optimization data');

  // Compute return and risk scores
  const scored = nmes.map(n => {
    const portfolioSpi = parseFloat(n.portfolio_spi) || 1;
    const portfolioCpi = parseFloat(n.portfolio_cpi) || 1;
    const evRatio = parseFloat(n.ev_ratio) || 0;
    const completionRatio = parseFloat(n.completion_ratio) || 0;

    // Return = weighted combination of EV ratio and task completion
    const returnScore = 0.6 * evRatio + 0.4 * completionRatio;

    // Risk = 0.5 * (1 - SPI) + 0.5 * (1 - CPI)
    const riskScore = Math.max(0, Math.min(1, 0.5 * (1 - portfolioSpi) + 0.5 * (1 - portfolioCpi)));

    return {
      ...n,
      return_score: returnScore,
      risk_score: riskScore,
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

  // Rank frontier NMEs
  const frontierNMEs = scored.filter(n => n.is_frontier);
  frontierNMEs.sort((a, b) => a.risk_score - b.risk_score);
  frontierNMEs.forEach((n, idx) => {
    n.frontier_rank = idx + 1;
  });

  // Compute combined score and recommendation
  const medianScore = [...scored]
    .map(n => 0.5 * n.return_score + 0.5 * (1 - n.risk_score))
    .sort((a, b) => a - b)[Math.floor(scored.length / 2)] || 0.5;

  for (const n of scored) {
    n.combined_score = 0.5 * n.return_score + 0.5 * (1 - n.risk_score);

    if (n.is_frontier && n.combined_score >= medianScore * 1.2) {
      n.recommendation = 'SELECT';
    } else if (n.is_frontier) {
      n.recommendation = 'CONSIDER';
    } else if (n.combined_score >= medianScore) {
      n.recommendation = 'MONITOR';
    } else {
      n.recommendation = 'DEFER';
    }
  }

  // Insert NME recommendations
  for (const n of scored) {
    await client.query(`
      INSERT INTO nme_portfolio_opt (
        nme_id, return_score, risk_score,
        is_frontier, frontier_rank,
        recommendation, combined_score, computed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [
      n.nme_id,
      n.return_score.toFixed(6),
      n.risk_score.toFixed(6),
      n.is_frontier,
      n.frontier_rank || null,
      n.recommendation,
      n.combined_score.toFixed(6),
    ]);
  }

  console.log(`✓ Inserted ${scored.length} NME recommendations`);

  // Generate efficient frontier curve points
  // Interpolate between frontier points for smooth curve
  if (frontierNMEs.length >= 2) {
    const curvePoints = [];

    // Add actual frontier points
    for (const n of frontierNMEs) {
      curvePoints.push({
        risk: n.risk_score,
        return: n.return_score,
      });
    }

    // Interpolate additional points for smoother curve
    for (let i = 0; i < frontierNMEs.length - 1; i++) {
      const p1 = frontierNMEs[i];
      const p2 = frontierNMEs[i + 1];

      // Add 2 intermediate points
      for (let t = 0.33; t < 1; t += 0.33) {
        curvePoints.push({
          risk: p1.risk_score + t * (p2.risk_score - p1.risk_score),
          return: p1.return_score + t * (p2.return_score - p1.return_score),
        });
      }
    }

    // Sort by risk
    curvePoints.sort((a, b) => a.risk - b.risk);

    // Insert curve points
    for (const point of curvePoints) {
      await client.query(`
        INSERT INTO nme_frontier_curve (risk_value, return_value, computed_at)
        VALUES ($1, $2, NOW())
      `, [point.risk.toFixed(6), point.return.toFixed(6)]);
    }

    console.log(`✓ Inserted ${curvePoints.length} frontier curve points`);
  }

  const tierCounts = scored.reduce((acc, n) => {
    acc[n.recommendation] = (acc[n.recommendation] || 0) + 1;
    return acc;
  }, {});

  console.log('Tier distribution:', tierCounts);
  console.log(`Frontier NMEs: ${frontierNMEs.length}`);

  await client.end();
  console.log('Done');
}

computeNMEPortfolioOpt().catch(console.error);
