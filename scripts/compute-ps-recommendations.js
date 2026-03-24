/**
 * Compute PS (Principal Scientist) Recommendations
 * Simulates MLP model output based on staff performance metrics
 */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const THERAPEUTIC_AREAS = [
  'ONCOLOGY', 'CARDIOVASCULAR', 'NEUROLOGY', 'IMMUNOLOGY',
  'INFECTIOUS_DISEASE', 'METABOLIC', 'RESPIRATORY',
  'RARE_DISEASE', 'OPHTHALMOLOGY', 'DERMATOLOGY',
];

async function computePSRecommendations() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to database');

  // Get all active staff with their performance metrics
  const staffQuery = `
    SELECT
      s.id AS staff_id,
      s."firstName",
      s."lastName",
      s."yearsExperience",
      s.role,
      COALESCE(COUNT(DISTINCT tsa."trialId"), 0) AS trial_count,
      COALESCE(COUNT(t.id), 0) AS total_tasks,
      COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'DONE'), 0) AS done_tasks,
      COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'BLOCKED'), 0) AS blocked_tasks,
      COALESCE(SUM(t."actualHours"), 0) AS actual_hours,
      COALESCE(SUM(t."estimatedHours"), 0) AS est_hours
    FROM "Staff" s
    LEFT JOIN "Task" t ON t."assigneeId" = s.id
    LEFT JOIN "TrialStaffAssignment" tsa ON tsa."staffId" = s.id
    WHERE s."isActive" = true
    GROUP BY s.id
  `;

  const { rows: staffRows } = await client.query(staffQuery);
  console.log(`Found ${staffRows.length} active staff members`);

  // Get trial counts per therapeutic area for each staff
  const areaTrialQuery = `
    SELECT
      tsa."staffId" AS staff_id,
      n."therapeuticArea" AS therapeutic_area,
      COUNT(DISTINCT ct.id) AS area_trial_count
    FROM "TrialStaffAssignment" tsa
    JOIN "ClinicalTrial" ct ON ct.id = tsa."trialId"
    JOIN "NME" n ON n.id = ct."nmeId"
    GROUP BY tsa."staffId", n."therapeuticArea"
  `;

  const { rows: areaTrials } = await client.query(areaTrialQuery);
  const staffAreaTrials = {};
  for (const row of areaTrials) {
    if (!staffAreaTrials[row.staff_id]) staffAreaTrials[row.staff_id] = {};
    staffAreaTrials[row.staff_id][row.therapeutic_area] = parseInt(row.area_trial_count);
  }

  // Clear existing recommendations
  await client.query('DELETE FROM ps_recommendation');
  console.log('Cleared existing recommendations');

  // Compute fit scores for each staff member in each therapeutic area
  const recommendations = [];

  for (const staff of staffRows) {
    const totalTasks = parseInt(staff.total_tasks) || 1;
    const doneTasks = parseInt(staff.done_tasks);
    const blockedTasks = parseInt(staff.blocked_tasks);
    const yearsExp = parseInt(staff.years_experience);
    const estHours = parseFloat(staff.est_hours) || 1;
    const actualHours = parseFloat(staff.actual_hours);

    // Compute base performance score (0-1)
    const completionRate = doneTasks / totalTasks;
    const blockedRate = blockedTasks / totalTasks;
    const hoursAccuracy = Math.min(actualHours / estHours, 2) / 2; // Cap at 2x
    const expScore = Math.min(yearsExp / 15, 1); // Max out at 15 years

    // Combined base score
    const baseScore = (
      completionRate * 0.4 +
      (1 - blockedRate) * 0.2 +
      (1 - Math.abs(1 - hoursAccuracy)) * 0.2 +
      expScore * 0.2
    );

    for (const area of THERAPEUTIC_AREAS) {
      const areaTrialCount = staffAreaTrials[staff.staff_id]?.[area] || 0;

      // Boost score based on area experience
      const areaBoost = Math.min(areaTrialCount / 3, 0.3); // Up to 30% boost
      const finalScore = Math.min(baseScore + areaBoost, 1);

      // Simulate MLP probabilities (softmax-like distribution)
      let high, medium, low;
      if (finalScore >= 0.7) {
        high = 0.5 + (finalScore - 0.7) * 1.5;
        medium = (1 - high) * 0.7;
        low = 1 - high - medium;
      } else if (finalScore >= 0.4) {
        medium = 0.4 + (finalScore - 0.4) * 0.5;
        high = (1 - medium) * 0.4;
        low = 1 - high - medium;
      } else {
        low = 0.5 + (0.4 - finalScore) * 0.5;
        medium = (1 - low) * 0.6;
        high = 1 - low - medium;
      }

      // Add some randomness to simulate model variance
      const noise = () => (Math.random() - 0.5) * 0.1;
      high = Math.max(0, Math.min(1, high + noise()));
      medium = Math.max(0, Math.min(1, medium + noise()));
      low = Math.max(0, 1 - high - medium);

      // Determine fit label
      let fitLabel;
      if (high >= medium && high >= low) fitLabel = 2; // High
      else if (medium >= low) fitLabel = 1; // Medium
      else fitLabel = 0; // Low

      recommendations.push({
        staff_id: staff.staff_id,
        therapeutic_area: area,
        fit_label: fitLabel,
        high_fit_pct: high,
        medium_fit_pct: medium,
        low_fit_pct: low,
        area_trial_count: areaTrialCount,
        finalScore,
      });
    }
  }

  // Rank within each therapeutic area
  for (const area of THERAPEUTIC_AREAS) {
    const areaRecs = recommendations.filter(r => r.therapeutic_area === area);
    areaRecs.sort((a, b) => {
      // Sort by high_fit_pct desc, then by area_trial_count desc
      if (b.high_fit_pct !== a.high_fit_pct) return b.high_fit_pct - a.high_fit_pct;
      return b.area_trial_count - a.area_trial_count;
    });
    areaRecs.forEach((rec, idx) => {
      rec.rank_within_area = idx + 1;
    });
  }

  // Insert recommendations
  for (const rec of recommendations) {
    await client.query(`
      INSERT INTO ps_recommendation (
        staff_id, therapeutic_area, fit_label,
        high_fit_pct, medium_fit_pct, low_fit_pct,
        area_trial_count, rank_within_area, scored_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      rec.staff_id,
      rec.therapeutic_area,
      rec.fit_label,
      rec.high_fit_pct.toFixed(4),
      rec.medium_fit_pct.toFixed(4),
      rec.low_fit_pct.toFixed(4),
      rec.area_trial_count,
      rec.rank_within_area,
    ]);
  }

  console.log(`✓ Inserted ${recommendations.length} PS recommendations`);
  await client.end();
  console.log('Done');
}

computePSRecommendations().catch(console.error);
