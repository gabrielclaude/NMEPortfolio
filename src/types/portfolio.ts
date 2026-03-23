// Types for the Portfolio Optimization page
// Combines EVM (risk/return), Markowitz Efficient Frontier, and Nash Equilibrium

export interface PortfolioBaseRow {
  project_id: string;
  project_code: string;
  project_name: string;
  project_status: string;
  trial_id: string;
  nct_number: string;
  trial_phase: string;
  nme_id: string;
  nme_name: string;
  nme_code: string;
  therapeutic_area: string;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  task_completion_pct: number | null;
  spi: number;
  cpi: number;
  return_score: number;
  risk_score: number;
  ps_payoff: number;
  mm_payoff: number;
  ra_payoff: number;
}

export interface PortfolioRecommendationRow {
  project_id: string;
  return_score: number;
  risk_score: number;
  spi: number;
  cpi: number;
  is_frontier: boolean;
  nash_preferred: boolean;
  ps_payoff: number;
  mm_payoff: number;
  ra_payoff: number;
  recommendation: "SELECT" | "CONSIDER" | "MONITOR" | "DEFER";
  combined_score: number;
  computed_at: Date;
}

// Joined row for display (base + recommendation + project metadata)
export interface PortfolioDisplayRow extends PortfolioRecommendationRow {
  project_code: string;
  project_name: string;
  project_status: string;
  trial_phase: string;
  nme_name: string;
  nme_code: string;
  nme_id: string;
  therapeutic_area: string;
  task_completion_pct: number | null;
}

// For the Recharts scatter chart
export interface ChartPoint {
  project_id: string;
  project_name: string;
  x: number;          // risk_score
  y: number;          // return_score
  recommendation: string;
  is_frontier: boolean;
  nash_preferred: boolean;
  combined_score: number;
}
