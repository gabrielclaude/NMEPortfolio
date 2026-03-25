CREATE OR REPLACE VIEW v_nme_evm AS
WITH project_evm AS (
  SELECT
    n.id                                                           AS nme_id,
    n.name                                                         AS nme_name,
    n.code                                                         AS nme_code,
    n."therapeuticArea"                                            AS therapeutic_area,
    n.status                                                       AS nme_status,
    p.budget                                                       AS bac,
    -- PV per project
    p.budget * GREATEST(0.0, LEAST(1.0,
      EXTRACT(EPOCH FROM (CURRENT_DATE::TIMESTAMP - p."plannedStart")) /
      NULLIF(EXTRACT(EPOCH FROM (p."plannedEnd" - p."plannedStart")), 0)
    ))                                                             AS pv,
    -- EV per project
    p.budget * p."percentComplete" / 100.0                        AS ev,
    -- AC per project (hours-based, fallback to EV)
    CASE
      WHEN COALESCE(SUM(tk."estimatedHours"), 0) > 0
        THEN p.budget * COALESCE(SUM(tk."actualHours"), 0) / SUM(tk."estimatedHours")
      ELSE p.budget * p."percentComplete" / 100.0
    END                                                            AS ac,
    COALESCE(SUM(tk."estimatedHours"), 0)                         AS estimated_hours,
    COALESCE(SUM(tk."actualHours"), 0)                            AS actual_hours,
    COUNT(tk.id)                                                   AS task_count,
    COUNT(tk.id) FILTER (WHERE tk.status = 'DONE')                AS completed_tasks
  FROM "NME" n
  JOIN "ClinicalTrial" t ON t."nmeId" = n.id
  JOIN "Project" p ON p."trialId" = t.id
  LEFT JOIN "Milestone" m ON m."projectId" = p.id
  LEFT JOIN "Task" tk ON tk."milestoneId" = m.id
  WHERE p.budget IS NOT NULL AND p.budget > 0
  GROUP BY n.id, n.name, n.code, n."therapeuticArea", n.status,
           p.id, p.budget, p."plannedStart", p."plannedEnd", p."percentComplete"
)
SELECT
  nme_id,
  nme_name,
  nme_code,
  therapeutic_area,
  nme_status,
  COUNT(*)                                                          AS project_count,
  ROUND(SUM(bac)::NUMERIC, 2)                                       AS total_bac,
  ROUND(SUM(pv)::NUMERIC, 2)                                        AS total_pv,
  ROUND(SUM(ev)::NUMERIC, 2)                                        AS total_ev,
  ROUND(SUM(ac)::NUMERIC, 2)                                        AS total_ac,
  -- SPI = EV / PV (portfolio weighted)
  ROUND(
    (NULLIF(SUM(ev), 0) / NULLIF(SUM(pv), 0))::NUMERIC
  , 3)                                                              AS portfolio_spi,
  -- CPI = EV / AC (portfolio weighted)
  ROUND(
    (NULLIF(SUM(ev), 0) / NULLIF(SUM(ac), 0))::NUMERIC
  , 3)                                                              AS portfolio_cpi,
  -- EAC = BAC / CPI
  ROUND(
    (SUM(bac) / NULLIF(NULLIF(SUM(ev), 0) / NULLIF(SUM(ac), 0), 0))::NUMERIC
  , 2)                                                              AS portfolio_eac,
  -- VAC = BAC - EAC
  ROUND(
    (SUM(bac) - SUM(bac) / NULLIF(NULLIF(SUM(ev), 0) / NULLIF(SUM(ac), 0), 0))::NUMERIC
  , 2)                                                              AS portfolio_vac,
  SUM(estimated_hours)                                              AS total_estimated_hours,
  SUM(actual_hours)                                                 AS total_actual_hours,
  SUM(task_count)                                                   AS total_tasks,
  SUM(completed_tasks)                                              AS total_completed_tasks,
  ROUND(SUM(completed_tasks)::NUMERIC / NULLIF(SUM(task_count), 0) * 100, 1) AS task_completion_pct
FROM project_evm
GROUP BY nme_id, nme_name, nme_code, therapeutic_area, nme_status
ORDER BY total_bac DESC NULLS LAST;
