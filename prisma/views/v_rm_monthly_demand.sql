-- Resource Management: monthly FTE demand by study, role, and activity
-- Used by the RM dashboard to power the stacked bar chart and demand table.

CREATE OR REPLACE VIEW v_rm_monthly_demand AS
SELECT
  m.month_date,
  TO_CHAR(m.month_date, 'Mon-YY')           AS month_label,
  s.id                                       AS study_id,
  seg.role,
  seg.activity,
  seg.phase,
  seg.complexity,
  ROUND(SUM(m.fte_value)::NUMERIC, 4)        AS fte_demand
FROM rm_monthly_fte  m
JOIN rm_study_segment seg ON seg.id = m.segment_id
JOIN rm_study         s   ON s.id  = seg.study_id
GROUP BY
  m.month_date, s.id, seg.role, seg.activity, seg.phase, seg.complexity
ORDER BY
  m.month_date, s.id, seg.role, seg.activity;

-- Aggregate view: total monthly FTE by role (for chart)
CREATE OR REPLACE VIEW v_rm_monthly_by_role AS
SELECT
  m.month_date,
  TO_CHAR(m.month_date, 'Mon-YY')  AS month_label,
  seg.role,
  ROUND(SUM(m.fte_value)::NUMERIC, 4) AS fte_demand
FROM rm_monthly_fte  m
JOIN rm_study_segment seg ON seg.id = m.segment_id
GROUP BY m.month_date, seg.role
ORDER BY m.month_date, seg.role;
