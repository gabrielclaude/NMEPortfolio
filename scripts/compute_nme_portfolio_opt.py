"""
NME Portfolio — Markowitz Efficient Frontier Optimisation
=========================================================
Treats each active NME compound as a portfolio asset and applies
classical Markowitz mean-variance optimisation to identify the
optimal allocation across the compound pipeline.

Framework:
  1. Return score per NME  = composite of EV ratio + task completion + phase maturity
  2. Risk score per NME    = composite of EVM risk + phase risk + status risk
  3. Covariance matrix     = therapeutic-area-driven correlation structure
  4. Monte Carlo (50,000)  = random portfolios plotted on risk/return space
  5. scipy frontier curve  = exact min-variance at 60 target return levels
  6. Max-Sharpe portfolio  = optimal allocation weights
  7. Min-variance portfolio = most defensive allocation weights

Output tables:
  nme_portfolio_opt     — per-NME tier / weights / Sharpe ratio
  nme_frontier_curve    — (risk, return) points tracing the frontier

Run:
  DATABASE_URL=... python3.11 scripts/compute_nme_portfolio_opt.py
"""

import os
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import psycopg2
import psycopg2.extras
from scipy.optimize import minimize

# ── Database ───────────────────────────────────────────────────────────────────
DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://claudegabriel@localhost:5433/nme_portfolio"
)

def get_conn():
    return psycopg2.connect(DB_URL)

NME_METRICS_SQL = """
SELECT
    nme_id, nme_name, nme_code,
    therapeutic_area, molecule_type, nme_status,
    total_bac,
    ev_ratio, completion_ratio,
    phase_risk, status_risk, evm_risk
FROM v_nme_portfolio_metrics
"""

# ── 1. Composite return / risk scores ─────────────────────────────────────────
RISK_FREE_RATE = 0.05   # notional baseline for Sharpe calculation

def compute_scores(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in ["ev_ratio", "completion_ratio", "phase_risk",
                "status_risk", "evm_risk"]:
        df[col] = df[col].apply(lambda x: float(x) if x is not None else 0.0)

    # return_score: how much value is being delivered vs budgeted
    df["return_score"] = (
        0.50 * df["ev_ratio"].clip(0, 1) +
        0.30 * df["completion_ratio"].clip(0, 1) +
        0.20 * (1 - df["phase_risk"].clip(0, 1))   # phase maturity → higher return
    ).round(4)

    # risk_score: weighted blend of execution, phase, and regulatory risk
    df["risk_score"] = (
        0.50 * df["evm_risk"].clip(0, 1) +
        0.30 * df["phase_risk"].clip(0, 1) +
        0.20 * df["status_risk"].clip(0, 1)
    ).round(4)

    df["sharpe_ratio"] = (
        (df["return_score"] - RISK_FREE_RATE) /
        df["risk_score"].clip(lower=0.01)
    ).round(4)

    return df

# ── 2. Covariance matrix ───────────────────────────────────────────────────────
def build_covariance(df: pd.DataFrame) -> np.ndarray:
    """
    Σ_ii  = risk_i²
    Σ_ij  = ρ_ij × risk_i × risk_j
    ρ_ij  = 0.55 if same therapeutic area, else 0.15
    """
    n = len(df)
    risks = df["risk_score"].values
    tas   = df["therapeutic_area"].values

    rho = np.full((n, n), 0.15)
    for i in range(n):
        for j in range(n):
            if i == j:
                rho[i, j] = 1.0
            elif tas[i] == tas[j]:
                rho[i, j] = 0.55

    cov = rho * np.outer(risks, risks)
    # Ensure positive-definite (add small jitter to diagonal)
    cov += np.eye(n) * 1e-8
    return cov

# ── 3. Portfolio stats helper ─────────────────────────────────────────────────
def port_stats(weights: np.ndarray, mu: np.ndarray, cov: np.ndarray) -> tuple:
    ret  = float(weights @ mu)
    var  = float(weights @ cov @ weights)
    risk = float(np.sqrt(max(var, 0)))
    sharpe = (ret - RISK_FREE_RATE) / max(risk, 1e-6)
    return ret, risk, sharpe

# ── 4. Monte Carlo simulation ─────────────────────────────────────────────────
N_SIMS = 50_000

def monte_carlo(mu: np.ndarray, cov: np.ndarray) -> pd.DataFrame:
    n = len(mu)
    results = []
    rng = np.random.default_rng(42)

    # Also include single-asset and equal-weight portfolios
    baselines = [np.eye(n)[i] for i in range(n)]
    baselines.append(np.ones(n) / n)

    for w in baselines:
        ret, risk, sh = port_stats(w, mu, cov)
        results.append({"ret": ret, "risk": risk, "sharpe": sh,
                        "weights": w.tolist()})

    # Dirichlet random weights for uniform coverage over the simplex
    alpha = np.ones(n)
    for _ in range(N_SIMS):
        w = rng.dirichlet(alpha)
        ret, risk, sh = port_stats(w, mu, cov)
        results.append({"ret": ret, "risk": risk, "sharpe": sh,
                        "weights": w.tolist()})

    return pd.DataFrame(results)

# ── 5. scipy exact efficient frontier ─────────────────────────────────────────
def compute_frontier_curve(
    mu: np.ndarray, cov: np.ndarray, n_points: int = 60
) -> list[dict]:
    n = len(mu)
    constraints = [{"type": "eq", "fun": lambda w: np.sum(w) - 1}]
    bounds = [(0, 1)] * n
    w0 = np.ones(n) / n

    target_returns = np.linspace(mu.min(), mu.max(), n_points)
    curve = []

    for target_ret in target_returns:
        con = constraints + [{"type": "eq", "fun": lambda w, r=target_ret: w @ mu - r}]
        res = minimize(
            lambda w: float(w @ cov @ w),   # minimise variance
            w0,
            method="SLSQP",
            bounds=bounds,
            constraints=con,
            options={"ftol": 1e-12, "maxiter": 1000},
        )
        if res.success:
            w_opt = np.array(res.x).clip(0, 1)
            w_opt /= w_opt.sum()
            _, risk, _ = port_stats(w_opt, mu, cov)
            curve.append({
                "portfolio_risk": round(float(risk), 6),
                "portfolio_return": round(float(target_ret), 6),
                "is_min_variance": False,
                "is_max_sharpe": False,
            })

    return curve

# ── 6. Identify special portfolios ────────────────────────────────────────────
def find_optimal_portfolios(
    mc_df: pd.DataFrame,
) -> tuple[int, int]:
    """Returns indices of max-Sharpe and min-variance portfolios."""
    idx_sharpe  = mc_df["sharpe"].idxmax()
    idx_min_var = mc_df["risk"].idxmin()
    return int(idx_sharpe), int(idx_min_var)

# ── 7. Tier assignment ────────────────────────────────────────────────────────
def assign_tier(sharpe: float, p75: float, p50: float, p25: float) -> str:
    """
    Sharpe-ratio percentile tiers (more informative than portfolio-weight tiers
    when one asset dominates the max-Sharpe portfolio):
      CORE      = top 25% Sharpe  (best risk-adjusted returns)
      GROWTH    = 25–50% Sharpe   (above-median risk-adjusted returns)
      SATELLITE = 50–75% Sharpe   (below-median but positive contribution)
      EXCLUDE   = bottom 25%      (risk-adjusted underperformers)
    """
    if sharpe >= p75:
        return "CORE"
    if sharpe >= p50:
        return "GROWTH"
    if sharpe >= p25:
        return "SATELLITE"
    return "EXCLUDE"

# ── 8. Main ───────────────────────────────────────────────────────────────────
def main():
    print("Connecting to database…")
    conn = get_conn()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(NME_METRICS_SQL)
    rows = cur.fetchall()
    df = pd.DataFrame(rows)
    print(f"  Loaded {len(df)} NMEs from v_nme_portfolio_metrics")

    if df.empty:
        print("No NMEs found."); conn.close(); return

    df = compute_scores(df)
    mu  = df["return_score"].values.astype(float)
    cov = build_covariance(df)

    print(f"\n  Return scores: min={mu.min():.3f}  max={mu.max():.3f}  "
          f"mean={mu.mean():.3f}")
    print(f"  Risk scores:   min={df['risk_score'].min():.3f}  "
          f"max={df['risk_score'].max():.3f}  mean={df['risk_score'].mean():.3f}")

    # ── Monte Carlo ──────────────────────────────────────────────────────────
    print(f"\nRunning {N_SIMS:,} Monte Carlo simulations…")
    mc_df = monte_carlo(mu, cov)
    print(f"  Done. Best Sharpe in simulation: {mc_df['sharpe'].max():.4f}")

    idx_sharpe, idx_min_var = find_optimal_portfolios(mc_df)
    opt_weights    = np.array(mc_df.loc[idx_sharpe,  "weights"])
    min_var_weights= np.array(mc_df.loc[idx_min_var, "weights"])

    opt_ret,  opt_risk,  opt_sh  = port_stats(opt_weights,     mu, cov)
    mvp_ret,  mvp_risk,  mvp_sh  = port_stats(min_var_weights, mu, cov)

    print(f"\n  Max-Sharpe portfolio:   return={opt_ret:.3f}  "
          f"risk={opt_risk:.3f}  sharpe={opt_sh:.4f}")
    print(f"  Min-Variance portfolio: return={mvp_ret:.3f}  "
          f"risk={mvp_risk:.3f}  sharpe={mvp_sh:.4f}")

    # ── Exact frontier curve ─────────────────────────────────────────────────
    print("\nComputing exact efficient frontier (scipy SLSQP)…")
    frontier_pts = compute_frontier_curve(mu, cov, n_points=60)
    print(f"  Solved {len(frontier_pts)} frontier points")

    # Mark special points on curve
    if frontier_pts:
        min_var_pt = min(frontier_pts, key=lambda p: p["portfolio_risk"])
        min_var_pt["is_min_variance"] = True
        # Max-Sharpe on frontier: highest (return - Rf) / risk
        max_sh_pt = max(
            frontier_pts,
            key=lambda p: (p["portfolio_return"] - RISK_FREE_RATE) /
                          max(p["portfolio_risk"], 1e-6)
        )
        max_sh_pt["is_max_sharpe"] = True

    # ── Assign NME-level metrics ─────────────────────────────────────────────
    df["optimal_weight"]  = opt_weights.round(6)
    df["min_var_weight"]  = min_var_weights.round(6)
    df["is_frontier"]     = df["optimal_weight"] > 0.005

    p25 = float(df["sharpe_ratio"].quantile(0.25))
    p50 = float(df["sharpe_ratio"].quantile(0.50))
    p75 = float(df["sharpe_ratio"].quantile(0.75))
    df["tier"] = df["sharpe_ratio"].apply(
        lambda s: assign_tier(s, p75, p50, p25)
    )

    # ── Summary ──────────────────────────────────────────────────────────────
    tier_counts = df["tier"].value_counts()
    print(f"\n  Tier distribution — "
          f"CORE:{tier_counts.get('CORE',0)}  "
          f"GROWTH:{tier_counts.get('GROWTH',0)}  "
          f"SATELLITE:{tier_counts.get('SATELLITE',0)}  "
          f"EXCLUDE:{tier_counts.get('EXCLUDE',0)}")

    # ── Upsert NME opt results ───────────────────────────────────────────────
    print("\nWriting nme_portfolio_opt…")
    upsert_sql = """
    INSERT INTO nme_portfolio_opt
        (nme_id, return_score, risk_score, sharpe_ratio,
         is_frontier, optimal_weight, min_var_weight, tier,
         ev_ratio, evm_risk, phase_risk, computed_at)
    VALUES
        (%(nme_id)s, %(return_score)s, %(risk_score)s, %(sharpe_ratio)s,
         %(is_frontier)s, %(optimal_weight)s, %(min_var_weight)s, %(tier)s,
         %(ev_ratio)s, %(evm_risk)s, %(phase_risk)s, NOW())
    ON CONFLICT (nme_id) DO UPDATE SET
        return_score    = EXCLUDED.return_score,
        risk_score      = EXCLUDED.risk_score,
        sharpe_ratio    = EXCLUDED.sharpe_ratio,
        is_frontier     = EXCLUDED.is_frontier,
        optimal_weight  = EXCLUDED.optimal_weight,
        min_var_weight  = EXCLUDED.min_var_weight,
        tier            = EXCLUDED.tier,
        ev_ratio        = EXCLUDED.ev_ratio,
        evm_risk        = EXCLUDED.evm_risk,
        phase_risk      = EXCLUDED.phase_risk,
        computed_at     = EXCLUDED.computed_at
    """
    records = df[[
        "nme_id", "return_score", "risk_score", "sharpe_ratio",
        "is_frontier", "optimal_weight", "min_var_weight", "tier",
        "ev_ratio", "evm_risk", "phase_risk",
    ]].to_dict("records")

    for rec in records:
        rec["is_frontier"] = bool(rec["is_frontier"])
        for k in ["return_score","risk_score","sharpe_ratio","optimal_weight",
                  "min_var_weight","ev_ratio","evm_risk","phase_risk"]:
            rec[k] = float(rec[k])

    cur2 = conn.cursor()
    cur2.executemany(upsert_sql, records)

    # ── Write frontier curve ─────────────────────────────────────────────────
    print("Writing nme_frontier_curve…")
    cur2.execute("DELETE FROM nme_frontier_curve")   # truncate old curve
    if frontier_pts:
        cur2.executemany("""
            INSERT INTO nme_frontier_curve
                (portfolio_risk, portfolio_return, is_min_variance, is_max_sharpe, computed_at)
            VALUES
                (%(portfolio_risk)s, %(portfolio_return)s, %(is_min_variance)s,
                 %(is_max_sharpe)s, NOW())
        """, frontier_pts)

    conn.commit()
    print(f"  Wrote {len(records)} NME rows + {len(frontier_pts)} frontier curve points")

    # ── Print ranking table ──────────────────────────────────────────────────
    top = df.sort_values("sharpe_ratio", ascending=False)
    print("\n── NME Rankings ─────────────────────────────────────────────────────────")
    print(f"{'NME':<14} {'TA':<20} {'Ret':>5} {'Risk':>5} {'Sharpe':>7} "
          f"{'OptWt':>6} {'MVWt':>6} {'Tier':<10}")
    print("─" * 80)
    for _, r in top.iterrows():
        print(f"{r['nme_code']:<14} {r['therapeutic_area']:<20} "
              f"{r['return_score']:>5.3f} {r['risk_score']:>5.3f} "
              f"{r['sharpe_ratio']:>7.4f} {r['optimal_weight']:>6.3f} "
              f"{r['min_var_weight']:>6.3f} {r['tier']:<10}")

    conn.close()
    print("\nDone.")


if __name__ == "__main__":
    np.random.seed(42)
    main()
