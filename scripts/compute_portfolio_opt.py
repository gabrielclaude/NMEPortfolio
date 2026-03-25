"""
Portfolio Optimization — Efficient Frontier + Nash Equilibrium
==============================================================
Combines three frameworks to identify superior projects:

  1. EVM (CPI/SPI)       — performance-based risk/return scores
  2. Markowitz Frontier  — Pareto-optimal projects in (risk, return) space
  3. Nash Equilibrium    — projects where all stakeholder roles are satisfied

Output: portfolio_recommendation table populated with tier labels
        (SELECT / CONSIDER / MONITOR / DEFER) and combined scores.

Run:
  DATABASE_URL=... python3.11 scripts/compute_portfolio_opt.py
"""

import os
import sys
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import psycopg2
import psycopg2.extras

# ── Database connection ────────────────────────────────────────────────────────
DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://claudegabriel@localhost:5433/nme_portfolio"
)

def get_conn():
    return psycopg2.connect(DB_URL)

# ── 1. Pull project portfolio base data ───────────────────────────────────────
PORTFOLIO_SQL = """
SELECT
    project_id,
    project_code,
    project_name,
    project_status,
    trial_id,
    nct_number,
    trial_phase,
    nme_id,
    nme_name,
    nme_code,
    therapeutic_area,
    bac,
    pv,
    ev,
    ac,
    task_completion_pct,
    spi,
    cpi,
    return_score,
    risk_score,
    ps_payoff,
    mm_payoff,
    ra_payoff
FROM v_project_portfolio_base
"""

# ── 2. Pareto frontier (non-dominated set) ────────────────────────────────────
def compute_pareto_frontier(df: pd.DataFrame) -> pd.Series:
    """
    A project is on the efficient frontier if no other project dominates it.
    Project A dominates B if: A.return_score >= B.return_score
                          AND A.risk_score   <= B.risk_score
                          AND at least one inequality is strict.
    Returns a boolean Series indexed like df.
    """
    returns = df["return_score"].values.astype(float)
    risks   = df["risk_score"].values.astype(float)
    n = len(returns)
    is_frontier = np.ones(n, dtype=bool)

    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            # j dominates i if j is at least as good in both dims AND strictly better in one
            if (returns[j] >= returns[i] and risks[j] <= risks[i] and
                    (returns[j] > returns[i] or risks[j] < risks[i])):
                is_frontier[i] = False
                break

    return pd.Series(is_frontier, index=df.index)

# ── 3. Nash equilibrium preference ────────────────────────────────────────────
def compute_nash_preferred(df: pd.DataFrame) -> pd.Series:
    """
    A project is 'Nash preferred' when all three stakeholder roles have an
    above-average payoff on that project — meaning no role would benefit
    from unilaterally moving to a different project.

    Payoffs are task_completion_pct (0–100) per role per project.
    """
    mean_ps = df["ps_payoff"].mean()
    mean_mm = df["mm_payoff"].mean()
    mean_ra = df["ra_payoff"].mean()

    nash = (
        (df["ps_payoff"] >= mean_ps) &
        (df["mm_payoff"] >= mean_mm) &
        (df["ra_payoff"] >= mean_ra)
    )
    return nash

# ── 4. Combined score ─────────────────────────────────────────────────────────
def compute_combined_score(df: pd.DataFrame) -> pd.Series:
    """
    Blended score (0–1):
      40% → return_score          (EVM performance)
      40% → 1 − risk_score        (lower risk is better)
      20% → mean payoff / 100     (stakeholder alignment, normalised)
    """
    mean_payoff = (df["ps_payoff"] + df["mm_payoff"] + df["ra_payoff"]) / 3.0 / 100.0
    score = (
        0.40 * df["return_score"].clip(0, 1) +
        0.40 * (1 - df["risk_score"].clip(0, 1)) +
        0.20 * mean_payoff.clip(0, 1)
    )
    return score.round(4)

# ── 5. Recommendation tier ────────────────────────────────────────────────────
def assign_tier(row: pd.Series, median_score: float) -> str:
    if row["is_frontier"] and row["nash_preferred"]:
        return "SELECT"
    if row["is_frontier"] or row["nash_preferred"]:
        return "CONSIDER"
    if row["combined_score"] >= median_score:
        return "MONITOR"
    return "DEFER"

# ── 6. Main ───────────────────────────────────────────────────────────────────
def main():
    print("Connecting to database…")
    conn = get_conn()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(PORTFOLIO_SQL)
    rows = cur.fetchall()
    df = pd.DataFrame(rows)
    print(f"  Loaded {len(df)} projects from v_project_portfolio_base")

    if df.empty:
        print("No projects found — nothing to compute.")
        conn.close()
        return

    # Cast Decimal/object columns to float
    for col in ["bac", "pv", "ev", "ac", "task_completion_pct",
                "spi", "cpi", "return_score", "risk_score",
                "ps_payoff", "mm_payoff", "ra_payoff"]:
        df[col] = df[col].apply(lambda x: float(x) if x is not None else 0.0)

    # ── Compute framework metrics ──────────────────────────────────────────────
    df["is_frontier"]    = compute_pareto_frontier(df)
    df["nash_preferred"] = compute_nash_preferred(df)
    df["combined_score"] = compute_combined_score(df)

    median_score = float(df["combined_score"].median())
    df["recommendation"] = df.apply(assign_tier, axis=1, median_score=median_score)

    # ── Summary ────────────────────────────────────────────────────────────────
    tier_counts = df["recommendation"].value_counts()
    frontier_n  = df["is_frontier"].sum()
    nash_n      = df["nash_preferred"].sum()
    print(f"\n  Efficient frontier: {frontier_n} projects")
    print(f"  Nash preferred:     {nash_n} projects")
    print(f"  Tier distribution  —  SELECT: {tier_counts.get('SELECT', 0)}  "
          f"CONSIDER: {tier_counts.get('CONSIDER', 0)}  "
          f"MONITOR: {tier_counts.get('MONITOR', 0)}  "
          f"DEFER: {tier_counts.get('DEFER', 0)}")

    # ── Upsert to DB ───────────────────────────────────────────────────────────
    print("\nWriting recommendations to database…")
    upsert_sql = """
    INSERT INTO portfolio_recommendation
        (project_id, return_score, risk_score, spi, cpi,
         is_frontier, nash_preferred,
         ps_payoff, mm_payoff, ra_payoff,
         recommendation, combined_score, computed_at)
    VALUES
        (%(project_id)s, %(return_score)s, %(risk_score)s, %(spi)s, %(cpi)s,
         %(is_frontier)s, %(nash_preferred)s,
         %(ps_payoff)s, %(mm_payoff)s, %(ra_payoff)s,
         %(recommendation)s, %(combined_score)s, NOW())
    ON CONFLICT (project_id) DO UPDATE SET
        return_score   = EXCLUDED.return_score,
        risk_score     = EXCLUDED.risk_score,
        spi            = EXCLUDED.spi,
        cpi            = EXCLUDED.cpi,
        is_frontier    = EXCLUDED.is_frontier,
        nash_preferred = EXCLUDED.nash_preferred,
        ps_payoff      = EXCLUDED.ps_payoff,
        mm_payoff      = EXCLUDED.mm_payoff,
        ra_payoff      = EXCLUDED.ra_payoff,
        recommendation = EXCLUDED.recommendation,
        combined_score = EXCLUDED.combined_score,
        computed_at    = EXCLUDED.computed_at
    """

    records = df[[
        "project_id", "return_score", "risk_score", "spi", "cpi",
        "is_frontier", "nash_preferred",
        "ps_payoff", "mm_payoff", "ra_payoff",
        "recommendation", "combined_score",
    ]].to_dict("records")

    # Convert numpy booleans → Python booleans for psycopg2
    for rec in records:
        rec["is_frontier"]    = bool(rec["is_frontier"])
        rec["nash_preferred"] = bool(rec["nash_preferred"])
        rec["spi"]            = float(rec["spi"])
        rec["cpi"]            = float(rec["cpi"])

    cur2 = conn.cursor()
    cur2.executemany(upsert_sql, records)
    conn.commit()
    print(f"  Wrote {len(records)} recommendation rows")

    # ── Print top 10 by combined score ─────────────────────────────────────────
    top = df.nlargest(10, "combined_score")[
        ["project_name", "return_score", "risk_score",
         "is_frontier", "nash_preferred", "recommendation", "combined_score"]
    ]
    print("\n── Top 10 projects by combined score ─────────────────────────────")
    print(f"{'Project':<35} {'Ret':>5} {'Risk':>5} {'Frt':>4} {'Nash':>5} {'Tier':<9} {'Score':>6}")
    print("─" * 75)
    for _, r in top.iterrows():
        print(f"{r['project_name']:<35} {r['return_score']:>5.2f} {r['risk_score']:>5.2f} "
              f"{'Y' if r['is_frontier'] else 'N':>4} {'Y' if r['nash_preferred'] else 'N':>5} "
              f"{r['recommendation']:<9} {r['combined_score']:>6.4f}")

    conn.close()
    print("\nDone.")


if __name__ == "__main__":
    np.random.seed(42)
    main()
