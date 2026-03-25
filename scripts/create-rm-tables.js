/**
 * Create Resource Management tables and populate with sample data
 */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function createRMTables() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to database');

  // Create tables
  const tables = [
    // rm_study
    `CREATE TABLE IF NOT EXISTS rm_study (
      id TEXT PRIMARY KEY,
      phase INTEGER NOT NULL,
      complexity TEXT NOT NULL CHECK (complexity IN ('Low', 'Medium', 'High')),
      study_type TEXT NOT NULL DEFAULT 'Follow-on',
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // rm_study_segment
    `CREATE TABLE IF NOT EXISTS rm_study_segment (
      id SERIAL PRIMARY KEY,
      study_id TEXT NOT NULL REFERENCES rm_study(id),
      phase_code TEXT NOT NULL CHECK (phase_code IN ('SU', 'C', 'CO')),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      role TEXT NOT NULL,
      fte_per_month DECIMAL(5,3) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // rm_personnel
    `CREATE TABLE IF NOT EXISTS rm_personnel (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      total_allocation DECIMAL(4,2) NOT NULL DEFAULT 1.0,
      adjustment DECIMAL(4,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // rm_staff_assignment
    `CREATE TABLE IF NOT EXISTS rm_staff_assignment (
      id SERIAL PRIMARY KEY,
      study_id TEXT NOT NULL REFERENCES rm_study(id),
      personnel_id INTEGER NOT NULL REFERENCES rm_personnel(id),
      role TEXT NOT NULL,
      allocation_pct DECIMAL(5,4) NOT NULL DEFAULT 1.0,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // rm_fte_matrix
    `CREATE TABLE IF NOT EXISTS rm_fte_matrix (
      id SERIAL PRIMARY KEY,
      complexity TEXT NOT NULL,
      role TEXT NOT NULL,
      phase INTEGER NOT NULL,
      activity TEXT NOT NULL,
      fte_per_month DECIMAL(5,3) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,
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

  // Create view
  const viewSql = `
    CREATE OR REPLACE VIEW v_rm_monthly_by_role AS
    WITH months AS (
      SELECT generate_series(
        '2024-01-01'::date,
        '2026-12-01'::date,
        '1 month'::interval
      )::date AS month_date
    ),
    segment_months AS (
      SELECT
        m.month_date,
        ss.role,
        ss.fte_per_month *
          GREATEST(0, LEAST(
            (ss.end_date - m.month_date + 1)::float /
            DATE_PART('day', (DATE_TRUNC('month', m.month_date) + INTERVAL '1 month - 1 day')::date),
            (m.month_date + INTERVAL '1 month - 1 day')::date - ss.start_date + 1
          ) /
          DATE_PART('day', (DATE_TRUNC('month', m.month_date) + INTERVAL '1 month - 1 day')::date))
          AS prorated_fte
      FROM months m
      CROSS JOIN rm_study_segment ss
      WHERE m.month_date >= DATE_TRUNC('month', ss.start_date)
        AND m.month_date <= DATE_TRUNC('month', ss.end_date)
    )
    SELECT
      month_date,
      TO_CHAR(month_date, 'Mon YYYY') AS month_label,
      role,
      COALESCE(SUM(prorated_fte), 0) AS fte_demand
    FROM segment_months
    GROUP BY month_date, role
    ORDER BY month_date, role
  `;

  try {
    await client.query(viewSql);
    console.log('✓ Created view: v_rm_monthly_by_role');
  } catch (err) {
    console.error('✗ Error creating view:', err.message);
  }

  // Insert sample data
  console.log('\nInserting sample data...');

  // Sample studies (linking to existing clinical trials if possible)
  const trialResult = await client.query(`
    SELECT ct."nctNumber" AS nct, ct.phase
    FROM "ClinicalTrial" ct
    LIMIT 10
  `);

  const studyInserts = [];
  const complexities = ['Low', 'Medium', 'High'];

  for (let i = 0; i < trialResult.rows.length; i++) {
    const trial = trialResult.rows[i];
    const phaseNum = parseInt(trial.phase.replace(/[^0-9]/g, '')) || 2;
    const complexity = complexities[i % 3];
    studyInserts.push({ id: trial.nct, phase: phaseNum, complexity });
  }

  // Add some additional studies
  for (let i = 1; i <= 5; i++) {
    studyInserts.push({ id: `STUDY-00${i}`, phase: (i % 3) + 1, complexity: complexities[i % 3] });
  }

  for (const s of studyInserts) {
    try {
      await client.query(
        `INSERT INTO rm_study (id, phase, complexity) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [s.id, s.phase, s.complexity]
      );
    } catch (err) {
      // Ignore duplicates
    }
  }
  console.log(`✓ Inserted ${studyInserts.length} studies`);

  // Sample personnel
  const personnelNames = [
    'Dr. Sarah Chen', 'Dr. Michael Torres', 'Dr. Emily Watson',
    'Dr. James Liu', 'Dr. Anna Schmidt', 'Dr. Robert Kim',
    'Dr. Lisa Patel', 'Dr. David Brown', 'Dr. Maria Garcia',
    'Dr. John Anderson', 'Dr. Rachel Green', 'Dr. Thomas White'
  ];

  for (const name of personnelNames) {
    await client.query(
      `INSERT INTO rm_personnel (name, total_allocation) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [name, 0.8 + Math.random() * 0.4]
    );
  }
  console.log(`✓ Inserted ${personnelNames.length} personnel`);

  // Get personnel IDs
  const personnelResult = await client.query(`SELECT id, name FROM rm_personnel`);
  const personnelMap = new Map(personnelResult.rows.map(p => [p.name, p.id]));

  // Sample study segments
  const roles = ['Clinical Scientist', 'Medical Monitor', 'Clinical RA'];
  const segmentCount = await client.query(`SELECT COUNT(*) FROM rm_study_segment`);

  if (parseInt(segmentCount.rows[0].count) === 0) {
    let segIdx = 0;
    for (const study of studyInserts.slice(0, 10)) {
      // Start-up phase
      const suStart = new Date(2024, segIdx % 12, 1);
      const suEnd = new Date(2024, (segIdx % 12) + 3, 28);
      // Conduct phase
      const cStart = new Date(suEnd);
      cStart.setMonth(cStart.getMonth() + 1);
      const cEnd = new Date(cStart);
      cEnd.setMonth(cEnd.getMonth() + 12);
      // Close-out phase
      const coStart = new Date(cEnd);
      coStart.setMonth(coStart.getMonth() + 1);
      const coEnd = new Date(coStart);
      coEnd.setMonth(coEnd.getMonth() + 3);

      for (const role of roles) {
        const baseFte = role === 'Clinical Scientist' ? 0.3 : role === 'Medical Monitor' ? 0.25 : 0.15;

        // Start-up
        await client.query(
          `INSERT INTO rm_study_segment (study_id, phase_code, start_date, end_date, role, fte_per_month)
           VALUES ($1, 'SU', $2, $3, $4, $5)`,
          [study.id, suStart, suEnd, role, baseFte * 1.2]
        );

        // Conduct
        await client.query(
          `INSERT INTO rm_study_segment (study_id, phase_code, start_date, end_date, role, fte_per_month)
           VALUES ($1, 'C', $2, $3, $4, $5)`,
          [study.id, cStart, cEnd, role, baseFte]
        );

        // Close-out
        await client.query(
          `INSERT INTO rm_study_segment (study_id, phase_code, start_date, end_date, role, fte_per_month)
           VALUES ($1, 'CO', $2, $3, $4, $5)`,
          [study.id, coStart, coEnd, role, baseFte * 0.8]
        );
      }
      segIdx++;
    }
    console.log('✓ Inserted study segments');
  }

  // Sample staff assignments
  const assignCount = await client.query(`SELECT COUNT(*) FROM rm_staff_assignment`);

  if (parseInt(assignCount.rows[0].count) === 0) {
    const roleAssignments = [
      { role: 'Clinical Scientist', personnel: personnelNames.slice(0, 4) },
      { role: 'Medical Monitor', personnel: personnelNames.slice(4, 8) },
      { role: 'Support Medical Monitor', personnel: personnelNames.slice(8, 10) },
      { role: 'Development Team Lead', personnel: personnelNames.slice(10, 12) },
    ];

    for (let i = 0; i < Math.min(studyInserts.length, 10); i++) {
      const study = studyInserts[i];
      for (const ra of roleAssignments) {
        const person = ra.personnel[i % ra.personnel.length];
        const personnelId = personnelMap.get(person);
        if (personnelId) {
          await client.query(
            `INSERT INTO rm_staff_assignment (study_id, personnel_id, role, allocation_pct)
             VALUES ($1, $2, $3, $4)`,
            [study.id, personnelId, ra.role, 0.15 + Math.random() * 0.35]
          );
        }
      }
    }
    console.log('✓ Inserted staff assignments');
  }

  // Sample FTE matrix
  const matrixCount = await client.query(`SELECT COUNT(*) FROM rm_fte_matrix`);

  if (parseInt(matrixCount.rows[0].count) === 0) {
    const matrixData = [
      { complexity: 'Low',    role: 'Clinical Scientist', phase: 1, activity: 'Protocol Development',  fte: 0.20 },
      { complexity: 'Low',    role: 'Clinical Scientist', phase: 2, activity: 'Site Management',       fte: 0.15 },
      { complexity: 'Low',    role: 'Medical Monitor',    phase: 1, activity: 'Safety Review',         fte: 0.15 },
      { complexity: 'Low',    role: 'Medical Monitor',    phase: 2, activity: 'Medical Monitoring',    fte: 0.20 },
      { complexity: 'Low',    role: 'Clinical RA',        phase: 1, activity: 'Regulatory Submissions',fte: 0.10 },
      { complexity: 'Low',    role: 'Clinical RA',        phase: 2, activity: 'Compliance Oversight',  fte: 0.10 },
      { complexity: 'Medium', role: 'Clinical Scientist', phase: 1, activity: 'Protocol Development',  fte: 0.30 },
      { complexity: 'Medium', role: 'Clinical Scientist', phase: 2, activity: 'Site Management',       fte: 0.25 },
      { complexity: 'Medium', role: 'Medical Monitor',    phase: 1, activity: 'Safety Review',         fte: 0.25 },
      { complexity: 'Medium', role: 'Medical Monitor',    phase: 2, activity: 'Medical Monitoring',    fte: 0.30 },
      { complexity: 'Medium', role: 'Clinical RA',        phase: 1, activity: 'Regulatory Submissions',fte: 0.15 },
      { complexity: 'Medium', role: 'Clinical RA',        phase: 2, activity: 'Compliance Oversight',  fte: 0.15 },
      { complexity: 'High',   role: 'Clinical Scientist', phase: 1, activity: 'Protocol Development',  fte: 0.45 },
      { complexity: 'High',   role: 'Clinical Scientist', phase: 2, activity: 'Site Management',       fte: 0.40 },
      { complexity: 'High',   role: 'Medical Monitor',    phase: 1, activity: 'Safety Review',         fte: 0.35 },
      { complexity: 'High',   role: 'Medical Monitor',    phase: 2, activity: 'Medical Monitoring',    fte: 0.45 },
      { complexity: 'High',   role: 'Clinical RA',        phase: 1, activity: 'Regulatory Submissions',fte: 0.25 },
      { complexity: 'High',   role: 'Clinical RA',        phase: 2, activity: 'Compliance Oversight',  fte: 0.20 },
    ];

    for (const m of matrixData) {
      await client.query(
        `INSERT INTO rm_fte_matrix (complexity, role, phase, activity, fte_per_month)
         VALUES ($1, $2, $3, $4, $5)`,
        [m.complexity, m.role, m.phase, m.activity, m.fte]
      );
    }
    console.log('✓ Inserted FTE matrix data');
  }

  await client.end();
  console.log('\nDone creating RM tables and data');
}

createRMTables().catch(console.error);
