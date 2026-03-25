CREATE OR REPLACE VIEW v_trial_project_status AS
SELECT
  t.id                                                           AS trial_id,
  t."nctNumber"                                                  AS nct_number,
  t.title                                                        AS trial_title,
  t.phase,
  t.status                                                       AS trial_status,
  n.name                                                         AS nme_name,
  n.code                                                         AS nme_code,
  n."therapeuticArea"                                            AS therapeutic_area,
  t."targetEnrollment"                                           AS target_enrollment,
  t."actualEnrollment"                                           AS actual_enrollment,
  ROUND(
    (t."actualEnrollment"::NUMERIC / NULLIF(t."targetEnrollment", 0)) * 100, 1
  )                                                              AS enrollment_pct,
  t."plannedStartDate"                                           AS planned_start_date,
  t."plannedEndDate"                                             AS planned_end_date,
  t.sites,
  COUNT(DISTINCT p.id)                                           AS project_count,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'COMPLETED')    AS projects_completed,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'AT_RISK')      AS projects_at_risk,
  ROUND(AVG(p."percentComplete")::NUMERIC, 1)                    AS avg_completion,
  COUNT(DISTINCT tsa."staffId")                                  AS staff_count,
  CONCAT(ls."firstName", ' ', ls."lastName")                     AS lead_staff_name
FROM "ClinicalTrial" t
JOIN "NME"       n   ON n.id = t."nmeId"
LEFT JOIN "Project" p  ON p."trialId" = t.id
LEFT JOIN "TrialStaffAssignment" tsa ON tsa."trialId" = t.id
LEFT JOIN "Staff" ls ON ls.id = t."leadStaffId"
GROUP BY t.id, t."nctNumber", t.title, t.phase, t.status,
         n.name, n.code, n."therapeuticArea",
         t."targetEnrollment", t."actualEnrollment",
         t."plannedStartDate", t."plannedEndDate", t.sites,
         ls."firstName", ls."lastName";
