CREATE OR REPLACE VIEW v_project_evm AS
WITH task_hours AS (
  SELECT
    m."projectId"                              AS project_id,
    COALESCE(SUM(tk."estimatedHours"), 0)      AS total_estimated_hours,
    COALESCE(SUM(tk."actualHours"), 0)         AS total_actual_hours,
    COUNT(tk.id)                               AS task_count,
    COUNT(tk.id) FILTER (WHERE tk.status = 'DONE') AS completed_tasks
  FROM "Milestone" m
  LEFT JOIN "Task" tk ON tk."milestoneId" = m.id
  GROUP BY m."projectId"
)
SELECT
  p.id                                                          AS project_id,
  p.code                                                        AS project_code,
  p.name                                                        AS project_name,
  p.status                                                      AS project_status,
  p."plannedStart",
  p."plannedEnd",
  p."actualStart",
  p."actualEnd",
  p."percentComplete"                                           AS pct_complete,
  t.id                                                          AS trial_id,
  t."nctNumber"                                                 AS nct_number,
  t.phase                                                       AS trial_phase,
  n.id                                                          AS nme_id,
  n.name                                                        AS nme_name,
  n.code                                                        AS nme_code,
  n."therapeuticArea"                                           AS therapeutic_area,
  -- BAC
  p.budget                                                      AS bac,
  -- PV: BAC × time elapsed fraction (capped 0–1)
  ROUND((p.budget * GREATEST(0.0, LEAST(1.0,
    EXTRACT(EPOCH FROM (CURRENT_DATE::TIMESTAMP - p."plannedStart")) /
    NULLIF(EXTRACT(EPOCH FROM (p."plannedEnd" - p."plannedStart")), 0)
  )))::NUMERIC, 2)                                              AS pv,
  -- EV: BAC × % complete
  ROUND((p.budget * p."percentComplete" / 100.0)::NUMERIC, 2)  AS ev,
  -- AC: BAC × (actualHours / estimatedHours), fallback to EV when no hours
  ROUND(CASE
    WHEN th.total_estimated_hours > 0
      THEN p.budget * th.total_actual_hours / th.total_estimated_hours
    ELSE p.budget * p."percentComplete" / 100.0
  END::NUMERIC, 2)                                              AS ac,
  -- Task hour aggregates
  th.total_estimated_hours,
  th.total_actual_hours,
  th.task_count,
  th.completed_tasks,
  ROUND(
    th.completed_tasks::NUMERIC / NULLIF(th.task_count, 0) * 100, 1
  )                                                             AS task_completion_pct
FROM "Project" p
JOIN "ClinicalTrial" t ON t.id = p."trialId"
JOIN "NME" n ON n.id = t."nmeId"
LEFT JOIN task_hours th ON th.project_id = p.id
WHERE p.budget IS NOT NULL AND p.budget > 0;
