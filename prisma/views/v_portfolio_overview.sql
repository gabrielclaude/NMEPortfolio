CREATE OR REPLACE VIEW v_portfolio_overview AS
SELECT
  n.id                                                           AS nme_id,
  n.code                                                         AS nme_code,
  n.name                                                         AS nme_name,
  n."therapeuticArea"                                            AS therapeutic_area,
  n."moleculeType"                                               AS molecule_type,
  n.status                                                       AS nme_status,
  n."targetIndication"                                           AS target_indication,
  n."discoveryDate"                                              AS discovery_date,
  COUNT(DISTINCT t.id)                                           AS total_trials,
  COUNT(DISTINCT t.id) FILTER (
    WHERE t.status IN ('RECRUITING','ACTIVE','ENROLLMENT_COMPLETE')
  )                                                              AS active_trials,
  COUNT(DISTINCT t.id) FILTER (
    WHERE t.status = 'COMPLETED'
  )                                                              AS completed_trials,
  COUNT(DISTINCT p.id)                                           AS total_projects,
  ROUND(AVG(p."percentComplete")::NUMERIC, 1)                    AS avg_project_completion,
  MAX(t."plannedEndDate")                                        AS latest_trial_end,
  SUM(t.budget)                                                  AS total_budget_usd
FROM "NME" n
LEFT JOIN "ClinicalTrial" t ON t."nmeId" = n.id
LEFT JOIN "Project"       p ON p."trialId" = t.id
GROUP BY n.id, n.code, n.name, n."therapeuticArea",
         n."moleculeType", n.status, n."targetIndication", n."discoveryDate";
