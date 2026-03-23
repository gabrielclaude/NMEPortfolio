-- v_nme_portfolio_metrics
-- Extends v_nme_evm with risk/return components for Markowitz portfolio optimisation.
-- Used by scripts/compute_nme_portfolio_opt.py.

CREATE OR REPLACE VIEW v_nme_portfolio_metrics AS
WITH phase_risk AS (
  -- Lowest phase-risk value across all trials per NME
  -- (most-advanced trial drives the rating; lower = less risky)
  SELECT
    n.id AS nme_id,
    MIN(
      CASE t.phase::TEXT
        WHEN 'PHASE_1'         THEN 0.80
        WHEN 'PHASE_1B'        THEN 0.75
        WHEN 'PHASE_2'         THEN 0.55
        WHEN 'PHASE_2B'        THEN 0.50
        WHEN 'PHASE_3'         THEN 0.30
        WHEN 'PHASE_3B'        THEN 0.25
        WHEN 'PHASE_4'         THEN 0.10
        WHEN 'EXPANDED_ACCESS' THEN 0.05
        ELSE                        0.70
      END
    ) AS phase_risk_score
  FROM "NME" n
  JOIN "ClinicalTrial" t ON t."nmeId" = n.id
  GROUP BY n.id
),
status_risk AS (
  SELECT
    id AS nme_id,
    CASE status::TEXT
      WHEN 'APPROVED'     THEN 0.05
      WHEN 'NDA_FILED'    THEN 0.10
      WHEN 'PHASE_4'      THEN 0.10
      WHEN 'PHASE_3'      THEN 0.25
      WHEN 'PHASE_2'      THEN 0.50
      WHEN 'PHASE_1'      THEN 0.75
      WHEN 'IND_FILED'    THEN 0.85
      WHEN 'PRECLINICAL'  THEN 0.90
      WHEN 'ON_HOLD'      THEN 0.80
      WHEN 'DISCONTINUED' THEN 1.00
      ELSE                     0.70
    END AS status_risk_score
  FROM "NME"
),
nme_role_payoffs AS (
  -- Average task_completion_pct per role, aggregated across all trials of each NME
  SELECT
    t."nmeId"                                                           AS nme_id,
    ROUND(AVG(CASE WHEN rc.role::TEXT = 'PRINCIPAL_SCIENTIST' THEN rc.task_completion_pct END)::NUMERIC, 2) AS ps_payoff,
    ROUND(AVG(CASE WHEN rc.role::TEXT = 'MEDICAL_MONITOR'     THEN rc.task_completion_pct END)::NUMERIC, 2) AS mm_payoff,
    ROUND(AVG(CASE WHEN rc.role::TEXT = 'RESEARCH_ASSOCIATE'  THEN rc.task_completion_pct END)::NUMERIC, 2) AS ra_payoff
  FROM "ClinicalTrial" t
  JOIN v_role_contributions rc ON rc.trial_id = t.id
  GROUP BY t."nmeId"
)
SELECT
  ne.nme_id,
  ne.nme_name,
  ne.nme_code,
  ne.therapeutic_area::TEXT                                            AS therapeutic_area,
  ne.nme_status::TEXT                                                  AS nme_status,
  n."moleculeType"::TEXT                                               AS molecule_type,
  ne.project_count,
  ne.total_bac,
  ne.total_pv,
  ne.total_ev,
  ne.total_ac,
  ne.portfolio_spi,
  ne.portfolio_cpi,
  ne.task_completion_pct,

  -- Component risks
  COALESCE(pr.phase_risk_score,  0.70)                                 AS phase_risk,
  sr.status_risk_score                                                 AS status_risk,

  -- EVM risk: 0.5*(1-SPI) + 0.5*(1-CPI), clamped [0,1]; missing → 0.5
  ROUND(GREATEST(0.0, LEAST(1.0,
    0.5 * GREATEST(0, 1 - COALESCE(ne.portfolio_spi, 0.5)) +
    0.5 * GREATEST(0, 1 - COALESCE(ne.portfolio_cpi, 0.5))
  ))::NUMERIC, 4)                                                      AS evm_risk,

  -- EV ratio (return from earned value vs budget)
  CASE
    WHEN ne.total_bac > 0
    THEN ROUND((ne.total_ev / ne.total_bac)::NUMERIC, 4)
    ELSE 0
  END                                                                  AS ev_ratio,

  -- Completion ratio (normalised 0-1)
  ROUND((COALESCE(ne.task_completion_pct, 0) / 100.0)::NUMERIC, 4)    AS completion_ratio,

  -- Role payoffs
  COALESCE(rp.ps_payoff, 0)                                            AS ps_payoff,
  COALESCE(rp.mm_payoff, 0)                                            AS mm_payoff,
  COALESCE(rp.ra_payoff, 0)                                            AS ra_payoff

FROM v_nme_evm ne
JOIN "NME" n ON n.id = ne.nme_id
JOIN status_risk sr ON sr.nme_id = ne.nme_id
LEFT JOIN phase_risk pr ON pr.nme_id = ne.nme_id
LEFT JOIN nme_role_payoffs rp ON rp.nme_id = ne.nme_id;
