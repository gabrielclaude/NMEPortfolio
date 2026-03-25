require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function createTables() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to database');

  const tables = [
    // ps_recommendation table
    `CREATE TABLE IF NOT EXISTS ps_recommendation (
      id SERIAL PRIMARY KEY,
      staff_id TEXT NOT NULL REFERENCES "Staff"(id),
      therapeutic_area TEXT NOT NULL,
      fit_label INTEGER NOT NULL,
      high_fit_pct DECIMAL(5,4) NOT NULL DEFAULT 0,
      medium_fit_pct DECIMAL(5,4) NOT NULL DEFAULT 0,
      low_fit_pct DECIMAL(5,4) NOT NULL DEFAULT 0,
      area_trial_count INTEGER NOT NULL DEFAULT 0,
      rank_within_area INTEGER NOT NULL DEFAULT 0,
      scored_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(staff_id, therapeutic_area)
    )`,

    // portfolio_recommendation table
    `CREATE TABLE IF NOT EXISTS portfolio_recommendation (
      id SERIAL PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES "Project"(id),
      return_score DECIMAL(8,6) NOT NULL DEFAULT 0,
      risk_score DECIMAL(8,6) NOT NULL DEFAULT 0,
      spi DECIMAL(8,6) NOT NULL DEFAULT 1,
      cpi DECIMAL(8,6) NOT NULL DEFAULT 1,
      is_frontier BOOLEAN NOT NULL DEFAULT FALSE,
      nash_preferred BOOLEAN NOT NULL DEFAULT FALSE,
      ps_payoff DECIMAL(8,4) NOT NULL DEFAULT 0,
      mm_payoff DECIMAL(8,4) NOT NULL DEFAULT 0,
      ra_payoff DECIMAL(8,4) NOT NULL DEFAULT 0,
      recommendation TEXT NOT NULL DEFAULT 'DEFER',
      combined_score DECIMAL(8,6) NOT NULL DEFAULT 0,
      computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(project_id)
    )`,

    // nme_portfolio_opt table
    `CREATE TABLE IF NOT EXISTS nme_portfolio_opt (
      id SERIAL PRIMARY KEY,
      nme_id TEXT NOT NULL REFERENCES "NME"(id),
      return_score DECIMAL(8,6) NOT NULL DEFAULT 0,
      risk_score DECIMAL(8,6) NOT NULL DEFAULT 0,
      is_frontier BOOLEAN NOT NULL DEFAULT FALSE,
      frontier_rank INTEGER,
      recommendation TEXT NOT NULL DEFAULT 'DEFER',
      combined_score DECIMAL(8,6) NOT NULL DEFAULT 0,
      computed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(nme_id)
    )`,

    // nme_frontier_curve table
    `CREATE TABLE IF NOT EXISTS nme_frontier_curve (
      id SERIAL PRIMARY KEY,
      risk_value DECIMAL(8,6) NOT NULL,
      return_value DECIMAL(8,6) NOT NULL,
      computed_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`
  ];

  for (const sql of tables) {
    try {
      await client.query(sql);
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
      console.log('✓ Created table:', tableName);
    } catch (err) {
      console.error('✗ Error:', err.message);
    }
  }

  await client.end();
  console.log('Done creating tables');
}

createTables().catch(console.error);
