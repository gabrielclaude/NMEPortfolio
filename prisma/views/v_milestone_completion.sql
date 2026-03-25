CREATE OR REPLACE VIEW v_milestone_completion AS
SELECT
  m.id                                                          AS milestone_id,
  m.name                                                        AS milestone_name,
  m.status                                                      AS milestone_status,
  m."dueDate"                                                   AS due_date,
  m."completedDate"                                             AS completed_date,
  m."isCriticalPath"                                            AS is_critical_path,
  p.id                                                          AS project_id,
  p.code                                                        AS project_code,
  p.name                                                        AS project_name,
  t."nctNumber"                                                 AS nct_number,
  t.phase,
  n.name                                                        AS nme_name,
  COUNT(tk.id)                                                  AS total_tasks,
  COUNT(tk.id) FILTER (WHERE tk.status = 'DONE')               AS completed_tasks,
  COUNT(tk.id) FILTER (WHERE tk.status = 'BLOCKED')            AS blocked_tasks,
  ROUND(
    COUNT(tk.id) FILTER (WHERE tk.status = 'DONE')::NUMERIC
    / NULLIF(COUNT(tk.id), 0) * 100, 1
  )                                                             AS task_completion_pct,
  CASE
    WHEN m.status != 'COMPLETED' AND m."dueDate" < CURRENT_DATE THEN TRUE
    ELSE FALSE
  END                                                           AS is_overdue,
  (m."dueDate"::DATE - CURRENT_DATE)                           AS days_until_due
FROM "Milestone" m
JOIN "Project"       p  ON p.id = m."projectId"
JOIN "ClinicalTrial" t  ON t.id = p."trialId"
JOIN "NME"           n  ON n.id = t."nmeId"
LEFT JOIN "Task"     tk ON tk."milestoneId" = m.id
GROUP BY m.id, m.name, m.status, m."dueDate", m."completedDate",
         m."isCriticalPath", p.id, p.code, p.name,
         t."nctNumber", t.phase, n.name;
