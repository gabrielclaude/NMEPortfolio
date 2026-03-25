-- v_project_portfolio_base
-- Combines EVM metrics with stakeholder payoffs for portfolio optimization.
-- Used by scripts/compute_portfolio_opt.py to compute the efficient frontier
-- and Nash equilibrium, then write to portfolio_recommendation.

CREATE OR REPLACE VIEW v_project_portfolio_base AS
WITH spi_cpi AS (
  SELECT
    project_id,
    bac,
    pv,
    ev,
    ac,
    task_completion_pct,
    CASE WHEN pv > 0 THEN ROUND((ev / pv)::NUMERIC, 4) ELSE 1 END AS spi,
    CASE WHEN ac > 0 THEN ROUND((ev / ac)::NUMERIC, 4) ELSE 1 END AS cpi,
    CASE WHEN bac > 0 THEN ROUND((ev / bac)::NUMERIC, 4) ELSE 0 END AS return_score
  FROM v_project_evm
),
role_payoffs AS (
  SELECT
    p.id AS project_id,
    COALESCE(
      MAX(CASE WHEN rc.role::TEXT = 'PRINCIPAL_SCIENTIST'  THEN rc.task_completion_pct END), 0
    ) AS ps_payoff,
    COALESCE(
      MAX(CASE WHEN rc.role::TEXT = 'MEDICAL_MONITOR'      THEN rc.task_completion_pct END), 0
    ) AS mm_payoff,
    COALESCE(
      MAX(CASE WHEN rc.role::TEXT = 'RESEARCH_ASSOCIATE'   THEN rc.task_completion_pct END), 0
    ) AS ra_payoff
  FROM "Project" p
  JOIN v_role_contributions rc ON rc.trial_id = p."trialId"
  GROUP BY p.id
)
SELECT
  pe.project_id,
  pe.project_code,
  pe.project_name,
  pe.project_status::TEXT         AS project_status,
  pe."plannedStart",
  pe."plannedEnd",
  pe.trial_id,
  pe.nct_number,
  pe.trial_phase::TEXT            AS trial_phase,
  pe.nme_id,
  pe.nme_name,
  pe.nme_code,
  pe.therapeutic_area::TEXT       AS therapeutic_area,
  sc.bac,
  sc.pv,
  sc.ev,
  sc.ac,
  sc.task_completion_pct,
  sc.spi,
  sc.cpi,
  sc.return_score,
  ROUND(
    (0.5 * GREATEST(0, 1 - sc.spi) + 0.5 * GREATEST(0, 1 - sc.cpi))::NUMERIC,
    4
  )                               AS risk_score,
  COALESCE(rp.ps_payoff, 0)       AS ps_payoff,
  COALESCE(rp.mm_payoff, 0)       AS mm_payoff,
  COALESCE(rp.ra_payoff, 0)       AS ra_payoff
FROM v_project_evm pe
JOIN  spi_cpi sc ON sc.project_id = pe.project_id
LEFT JOIN role_payoffs rp ON rp.project_id = pe.project_id;
