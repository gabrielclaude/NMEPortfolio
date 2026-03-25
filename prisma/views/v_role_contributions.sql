CREATE OR REPLACE VIEW v_role_contributions AS
WITH
-- FTE effort by role per trial
trial_role_effort AS (
  SELECT
    tsa."trialId"                             AS trial_id,
    tsa.role,
    COUNT(DISTINCT tsa."staffId")             AS staff_count,
    ROUND(SUM(tsa.effort)::NUMERIC, 2)        AS total_fte_effort,
    ROUND(AVG(tsa.effort)::NUMERIC, 3)        AS avg_fte_effort
  FROM "TrialStaffAssignment" tsa
  GROUP BY tsa."trialId", tsa.role
),
-- Task contributions by staff role via Task.assigneeId → Staff.role
task_role_stats AS (
  SELECT
    p."trialId"                               AS trial_id,
    s.role,
    COUNT(tk.id)                              AS task_count,
    COUNT(tk.id) FILTER (WHERE tk.status = 'DONE')     AS completed_tasks,
    COUNT(tk.id) FILTER (WHERE tk.status IN ('TODO','IN_PROGRESS','IN_REVIEW','BLOCKED'))
                                              AS open_tasks,
    COUNT(tk.id) FILTER (WHERE tk.status = 'BLOCKED')  AS blocked_tasks,
    ROUND(COALESCE(SUM(tk."estimatedHours"), 0)::NUMERIC, 1) AS estimated_hours,
    ROUND(COALESCE(SUM(tk."actualHours"), 0)::NUMERIC, 1)    AS actual_hours
  FROM "Task" tk
  JOIN "Staff" s ON s.id = tk."assigneeId"
  JOIN "Milestone" m ON m.id = tk."milestoneId"
  JOIN "Project" p ON p.id = m."projectId"
  GROUP BY p."trialId", s.role
)
SELECT
  t.id                                        AS trial_id,
  t."nctNumber"                               AS nct_number,
  t.phase                                     AS trial_phase,
  t.status                                    AS trial_status,
  n.name                                      AS nme_name,
  n.code                                      AS nme_code,
  n."therapeuticArea"                         AS therapeutic_area,
  COALESCE(tre.role, trs.role)                AS role,
  COALESCE(tre.staff_count, 0)                AS staff_count,
  COALESCE(tre.total_fte_effort, 0)           AS total_fte_effort,
  COALESCE(tre.avg_fte_effort, 0)             AS avg_fte_effort,
  COALESCE(trs.task_count, 0)                 AS task_count,
  COALESCE(trs.completed_tasks, 0)            AS completed_tasks,
  COALESCE(trs.open_tasks, 0)                 AS open_tasks,
  COALESCE(trs.blocked_tasks, 0)              AS blocked_tasks,
  COALESCE(trs.estimated_hours, 0)            AS estimated_hours,
  COALESCE(trs.actual_hours, 0)               AS actual_hours,
  ROUND(
    COALESCE(trs.completed_tasks, 0)::NUMERIC /
    NULLIF(COALESCE(trs.task_count, 0), 0) * 100, 1
  )                                           AS task_completion_pct
FROM "ClinicalTrial" t
JOIN "NME" n ON n.id = t."nmeId"
FULL OUTER JOIN trial_role_effort tre ON tre.trial_id = t.id
FULL OUTER JOIN task_role_stats trs
  ON trs.trial_id = COALESCE(tre.trial_id, trs.trial_id)
  AND trs.role = tre.role
WHERE COALESCE(tre.role, trs.role) IN (
  'PRINCIPAL_SCIENTIST', 'MEDICAL_MONITOR', 'RESEARCH_ASSOCIATE'
);
