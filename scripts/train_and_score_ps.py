"""
Principal Scientist Selection Model — Train & Score
====================================================
Adapted from Scientist_Selection_06.ipynb.

Uses the same MLP architecture (Dense 128 → Dropout 0.2 → Dense 64 → Dense 3 softmax)
but trained on actual staff performance data from the NME Portfolio database.

Features used (mapped from notebook to DB):
  experience_years      → Staff.yearsExperience
  trial_count           → # distinct trials assigned  (collaboration_score proxy)
  task_completion_rate  → done_tasks / total_tasks    (project_success_rate proxy)
  blocked_task_rate     → blocked_tasks / total_tasks
  on_time_rate          → tasks done before dueDate / done_tasks  (on_time_completion proxy)
  hours_accuracy        → actualHours / estimatedHours             (overtime_pay proxy)
  avg_fte_effort        → AVG(TrialStaffAssignment.effort)
  avg_team_size         → AVG(# staff per trial)                  (team_size proxy)

Labels (derived from actual performance):
  2 = High Fit   → completion_rate >= 0.65 AND blocked_rate <= 0.15
  1 = Medium Fit → completion_rate >= 0.40
  0 = Low Fit    → otherwise

Because the dataset is small (26 staff), the script bootstraps 20× augmented
training samples per staff member using Gaussian noise, then trains the MLP.

Output: ps_recommendation table populated with rank of each active PS per
        therapeutic area, including model confidence scores.
"""

import os
import sys
import warnings
warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import numpy as np
import pandas as pd
import psycopg2
import psycopg2.extras
import joblib
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# ── Database connection ───────────────────────────────────────────────────────
DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://claudegabriel@localhost:5433/nme_portfolio"
)

def get_conn():
    return psycopg2.connect(DB_URL)

# ── 1. Pull staff features ────────────────────────────────────────────────────
STAFF_FEATURES_SQL = """
SELECT
    s.id                                                          AS staff_id,
    s."firstName" || ' ' || s."lastName"                         AS full_name,
    s.role::TEXT                                                  AS role,
    s."yearsExperience"                                           AS years_experience,
    COALESCE(COUNT(DISTINCT tsa."trialId"), 0)                    AS trial_count,
    COALESCE(COUNT(tk.id), 0)                                     AS total_tasks,
    COALESCE(COUNT(tk.id) FILTER (WHERE tk.status = 'DONE'), 0)   AS done_tasks,
    COALESCE(COUNT(tk.id) FILTER (WHERE tk.status = 'BLOCKED'), 0) AS blocked_tasks,
    COALESCE(SUM(tk."actualHours"),    0)                         AS actual_hours,
    COALESCE(SUM(tk."estimatedHours"), 0)                         AS est_hours,
    COALESCE(AVG(tsa.effort), 0.5)                                AS avg_fte_effort,
    -- on-time: tasks completed on or before their dueDate
    COALESCE(
        COUNT(tk.id) FILTER (
            WHERE tk.status = 'DONE'
              AND tk."completedAt" IS NOT NULL
              AND tk."dueDate"     IS NOT NULL
              AND tk."completedAt" <= tk."dueDate"
        )::FLOAT / NULLIF(COUNT(tk.id) FILTER (WHERE tk.status = 'DONE'), 0),
        0.5
    )                                                             AS on_time_rate
FROM "Staff" s
LEFT JOIN "TrialStaffAssignment" tsa ON tsa."staffId" = s.id
LEFT JOIN "Task" tk ON tk."assigneeId" = s.id
WHERE s."isActive" = true
GROUP BY s.id, s."firstName", s."lastName", s.role, s."yearsExperience"
ORDER BY s.role, trial_count DESC
"""

AVG_TEAM_SIZE_SQL = """
SELECT
    tsa."staffId"           AS staff_id,
    AVG(team_sizes.cnt)     AS avg_team_size
FROM "TrialStaffAssignment" tsa
JOIN (
    SELECT "trialId", COUNT(*) AS cnt
    FROM "TrialStaffAssignment"
    GROUP BY "trialId"
) team_sizes ON team_sizes."trialId" = tsa."trialId"
GROUP BY tsa."staffId"
"""

# Per-area trial count for PS staff only
PS_AREA_SQL = """
SELECT
    tsa."staffId"           AS staff_id,
    n."therapeuticArea"::TEXT AS therapeutic_area,
    COUNT(DISTINCT tsa."trialId") AS area_trial_count
FROM "TrialStaffAssignment" tsa
JOIN "ClinicalTrial" t ON t.id = tsa."trialId"
JOIN "NME" n ON n.id = t."nmeId"
JOIN "Staff" s ON s.id = tsa."staffId"
WHERE s.role = 'PRINCIPAL_SCIENTIST' AND s."isActive" = true
GROUP BY tsa."staffId", n."therapeuticArea"
"""

ALL_THERAPEUTIC_AREAS = [
    "ONCOLOGY", "CARDIOVASCULAR", "NEUROLOGY", "IMMUNOLOGY",
    "INFECTIOUS_DISEASE", "METABOLIC", "RESPIRATORY",
    "RARE_DISEASE", "OPHTHALMOLOGY", "DERMATOLOGY",
]

FEATURE_COLS = [
    "years_experience", "trial_count", "task_completion_rate",
    "blocked_task_rate", "on_time_rate", "hours_accuracy",
    "avg_fte_effort", "avg_team_size",
]

# ── 2. Compute derived fields & label ────────────────────────────────────────
def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # Cast all numeric columns coming from psycopg2 (may be Decimal objects)
    for col in ["years_experience", "trial_count", "total_tasks", "done_tasks",
                "blocked_tasks", "actual_hours", "est_hours",
                "avg_fte_effort", "avg_team_size", "on_time_rate"]:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: float(x) if x is not None else 0.0)
    df["task_completion_rate"] = (
        df["done_tasks"] / df["total_tasks"].replace(0, np.nan)
    ).fillna(0.0).clip(0, 1)

    df["blocked_task_rate"] = (
        df["blocked_tasks"] / df["total_tasks"].replace(0, np.nan)
    ).fillna(0.0).clip(0, 1)

    df["hours_accuracy"] = (
        df["actual_hours"] / df["est_hours"].replace(0, np.nan)
    ).fillna(1.0).clip(0, 3.0)

    return df

def assign_label(row) -> int:
    rate    = row["task_completion_rate"]
    blocked = row["blocked_task_rate"]
    if rate >= 0.65 and blocked <= 0.15:
        return 2   # High Fit
    elif rate >= 0.40:
        return 1   # Medium Fit
    return 0       # Low Fit

# ── 3. Data augmentation (Gaussian noise) ────────────────────────────────────
def augment(df: pd.DataFrame, n: int = 20, noise: float = 0.05) -> pd.DataFrame:
    """
    Generate n noisy copies of each row to expand the small dataset.
    Categorical metadata (staff_id, full_name, role) is preserved as-is.
    Labels stay the same — the noisy copies represent near-identical profiles.
    """
    rows = []
    for _, row in df.iterrows():
        rows.append(row.to_dict())
        for _ in range(n - 1):
            copy = row.to_dict()
            for col in FEATURE_COLS:
                std = max(abs(copy[col]) * noise, 0.01)
                copy[col] = float(np.clip(copy[col] + np.random.normal(0, std), 0, None))
            rows.append(copy)
    return pd.DataFrame(rows)

# ── 4. Build & train the MLP (matches notebook architecture) ─────────────────
def build_model(input_dim: int) -> tf.keras.Model:
    model = tf.keras.Sequential([
        tf.keras.Input(shape=(input_dim,)),
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation="relu"),
        tf.keras.layers.Dense(3, activation="softmax"),
    ])
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model

# ── 5. Main ──────────────────────────────────────────────────────────────────
def main():
    print("Connecting to database…")
    conn = get_conn()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # --- Load staff features ---
    cur.execute(STAFF_FEATURES_SQL)
    staff_df = pd.DataFrame(cur.fetchall())
    print(f"  Loaded {len(staff_df)} active staff members")

    cur.execute(AVG_TEAM_SIZE_SQL)
    team_df = pd.DataFrame(cur.fetchall())
    staff_df = staff_df.merge(team_df, on="staff_id", how="left")
    staff_df["avg_team_size"] = staff_df["avg_team_size"].fillna(3.0)

    cur.execute(PS_AREA_SQL)
    area_df = pd.DataFrame(cur.fetchall()) if cur.rowcount != 0 else pd.DataFrame(
        columns=["staff_id", "therapeutic_area", "area_trial_count"]
    )
    # Re-fetch properly
    cur.execute(PS_AREA_SQL)
    rows = cur.fetchall()
    area_df = pd.DataFrame(rows) if rows else pd.DataFrame(
        columns=["staff_id", "therapeutic_area", "area_trial_count"]
    )

    # --- Build features ---
    staff_df = build_features(staff_df)
    staff_df["fit_label"] = staff_df.apply(assign_label, axis=1)

    label_counts = staff_df["fit_label"].value_counts().sort_index()
    print(f"  Label distribution — Low:{label_counts.get(0,0)}  "
          f"Medium:{label_counts.get(1,0)}  High:{label_counts.get(2,0)}")

    # --- Augment ---
    aug_df = augment(staff_df, n=20)
    print(f"  Augmented to {len(aug_df)} training samples")

    X_all = aug_df[FEATURE_COLS].values.astype(np.float32)
    y_all = aug_df["fit_label"].values.astype(np.int32)

    # --- Scale ---
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_all)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_all, test_size=0.2, random_state=42, stratify=y_all
    )

    # --- Train ---
    print("\nTraining MLP (Dense 128 → Dropout 0.2 → Dense 64 → Dense 3)…")
    model = build_model(X_train.shape[1])
    model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=16,
        validation_data=(X_test, y_test),
        verbose=0,
    )

    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"  Validation accuracy: {test_acc*100:.1f}%  |  loss: {test_loss:.4f}")

    # --- Save model + scaler ---
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    model.save(os.path.join(models_dir, "ps_model.keras"))
    joblib.dump(scaler, os.path.join(models_dir, "ps_scaler.pkl"))
    print(f"  Saved model to models/ps_model.keras")

    # --- Score PS candidates ---
    ps_df = staff_df[staff_df["role"] == "PRINCIPAL_SCIENTIST"].copy()
    if ps_df.empty:
        print("No active Principal Scientist staff found — nothing to score.")
        conn.close()
        return

    print(f"\nScoring {len(ps_df)} Principal Scientist candidates…")
    X_ps = scaler.transform(ps_df[FEATURE_COLS].values.astype(np.float32))
    probs = model.predict(X_ps, verbose=0)   # shape: (n_ps, 3)

    # --- Build recommendation rows for every PS × area ---
    area_lookup = {}
    if not area_df.empty:
        for _, row in area_df.iterrows():
            area_lookup[(row["staff_id"], row["therapeutic_area"])] = int(row["area_trial_count"])

    records = []
    for i, (_, ps_row) in enumerate(ps_df.iterrows()):
        sid   = ps_row["staff_id"]
        low_p, med_p, high_p = float(probs[i][0]), float(probs[i][1]), float(probs[i][2])
        label = int(np.argmax(probs[i]))
        for area in ALL_THERAPEUTIC_AREAS:
            atc = area_lookup.get((sid, area), 0)
            records.append({
                "staff_id":         sid,
                "therapeutic_area": area,
                "fit_label":        label,
                "high_fit_pct":     round(high_p, 4),
                "medium_fit_pct":   round(med_p, 4),
                "low_fit_pct":      round(low_p, 4),
                "area_trial_count": atc,
            })

    rec_df = pd.DataFrame(records)

    # Rank within each area: primary = high_fit_pct DESC, secondary = area_trial_count DESC
    rec_df["rank_within_area"] = (
        rec_df.groupby("therapeutic_area")
              .apply(lambda g: g.sort_values(
                  ["high_fit_pct", "area_trial_count"],
                  ascending=[False, False]
              ).assign(rank_within_area=range(1, len(g) + 1))["rank_within_area"])
              .reset_index(level=0, drop=True)
    )

    # --- Write to DB ---
    print("Writing recommendations to database…")
    upsert_sql = """
    INSERT INTO ps_recommendation
        (staff_id, therapeutic_area, fit_label, high_fit_pct,
         medium_fit_pct, low_fit_pct, area_trial_count, rank_within_area, scored_at)
    VALUES
        (%(staff_id)s, %(therapeutic_area)s, %(fit_label)s, %(high_fit_pct)s,
         %(medium_fit_pct)s, %(low_fit_pct)s, %(area_trial_count)s, %(rank_within_area)s, NOW())
    ON CONFLICT (staff_id, therapeutic_area)
    DO UPDATE SET
        fit_label        = EXCLUDED.fit_label,
        high_fit_pct     = EXCLUDED.high_fit_pct,
        medium_fit_pct   = EXCLUDED.medium_fit_pct,
        low_fit_pct      = EXCLUDED.low_fit_pct,
        area_trial_count = EXCLUDED.area_trial_count,
        rank_within_area = EXCLUDED.rank_within_area,
        scored_at        = EXCLUDED.scored_at
    """
    cur2 = conn.cursor()
    cur2.executemany(upsert_sql, rec_df.to_dict("records"))
    conn.commit()
    print(f"  Wrote {len(rec_df)} recommendation rows ({len(ps_df)} PS × {len(ALL_THERAPEUTIC_AREAS)} areas)")

    # --- Print summary ---
    print("\n── Ranking summary ──────────────────────────────────────────────")
    print(f"{'Area':<22} {'Rank':<5} {'Name':<22} {'High%':>7} {'Label':<10} {'Area Trials':>11}")
    print("─" * 75)
    for area in sorted(ALL_THERAPEUTIC_AREAS):
        area_recs = rec_df[rec_df["therapeutic_area"] == area].sort_values("rank_within_area")
        for _, r in area_recs.iterrows():
            ps_name = ps_df.loc[ps_df["staff_id"] == r["staff_id"], "full_name"].values[0]
            label   = ["Low", "Medium", "High"][r["fit_label"]]
            print(f"{area:<22} #{r['rank_within_area']:<4} {ps_name:<22} "
                  f"{r['high_fit_pct']*100:>6.1f}%  {label:<10} {r['area_trial_count']:>4} trials")
        print()

    conn.close()
    print("Done.")

if __name__ == "__main__":
    np.random.seed(42)
    tf.random.set_seed(42)
    main()
