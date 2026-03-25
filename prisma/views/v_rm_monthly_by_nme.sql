-- View: Monthly FTE demand aggregated by NME and role
-- Used by /rm/nme page to show resource utilization per NME

CREATE OR REPLACE VIEW v_rm_monthly_by_nme AS
SELECT
  m.month_date,
  TO_CHAR(m.month_date, 'Mon-YY') AS month_label,
  s.nme_id,
  seg.role,
  ROUND(SUM(m.fte_value)::NUMERIC, 4) AS fte_demand
FROM rm_monthly_fte m
JOIN rm_study_segment seg ON seg.id = m.segment_id
JOIN rm_study s ON s.id = seg.study_id
WHERE s.nme_id IS NOT NULL
GROUP BY m.month_date, s.nme_id, seg.role
ORDER BY m.month_date, seg.role;
