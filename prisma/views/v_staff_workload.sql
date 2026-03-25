CREATE OR REPLACE VIEW v_staff_workload AS
SELECT
  s.id                                                               AS staff_id,
  s."employeeId"                                                     AS employee_id,
  CONCAT(s."firstName", ' ', s."lastName")                          AS staff_name,
  s."firstName"                                                      AS first_name,
  s."lastName"                                                       AS last_name,
  s.role,
  s.department,
  s.specialization,
  s."isActive"                                                       AS is_active,
  COUNT(DISTINCT tsa."trialId")                                      AS active_trial_count,
  COUNT(DISTINCT tk.id)                                              AS total_tasks,
  COUNT(DISTINCT tk.id) FILTER (
    WHERE tk.status IN ('TODO','IN_PROGRESS','IN_REVIEW')
  )                                                                  AS open_tasks,
  COUNT(DISTINCT tk.id) FILTER (WHERE tk.status = 'DONE')           AS completed_tasks,
  COUNT(DISTINCT tk.id) FILTER (WHERE tk.status = 'BLOCKED')        AS blocked_tasks,
  COUNT(DISTINCT tk.id) FILTER (
    WHERE tk.status NOT IN ('DONE','CANCELLED')
      AND tk."dueDate" < CURRENT_DATE
  )                                                                  AS overdue_tasks,
  COALESCE(SUM(tsa.effort), 0)                                       AS total_fte_effort,
  COALESCE(SUM(tk."estimatedHours")
    FILTER (WHERE tk.status NOT IN ('DONE','CANCELLED')), 0
  )                                                                  AS remaining_estimated_hours,
  COUNT(DISTINCT ma."milestoneId")                                   AS assigned_milestones
FROM "Staff" s
LEFT JOIN "TrialStaffAssignment" tsa ON tsa."staffId" = s.id
  AND (tsa."endDate" IS NULL OR tsa."endDate" > CURRENT_DATE)
LEFT JOIN "Task" tk ON tk."assigneeId" = s.id
LEFT JOIN "MilestoneAssignment" ma ON ma."staffId" = s.id
GROUP BY s.id, s."employeeId", s."firstName", s."lastName",
         s.role, s.department, s.specialization, s."isActive";
