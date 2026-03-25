// Types for the NME-level Markowitz Efficient Frontier dashboard

export interface NMEPortfolioOptRow {
  // From nme_portfolio_opt
  id: number;
  nme_id: string;
  return_score: number;
  risk_score: number;
  sharpe_ratio: number;
  is_frontier: boolean;
  optimal_weight: number;
  min_var_weight: number;
  tier: "CORE" | "GROWTH" | "SATELLITE" | "EXCLUDE";
  ev_ratio: number;
  evm_risk: number;
  phase_risk: number;
  computed_at: Date;
  // Joined from NME table
  nme_name: string;
  nme_code: string;
  therapeutic_area: string;
  nme_status: string;
  molecule_type: string;
  total_bac: number;
  portfolio_spi: number | null;
  portfolio_cpi: number | null;
  task_completion_pct: number | null;
}

export interface NMEFrontierCurvePoint {
  id: number;
  portfolio_risk: number;
  portfolio_return: number;
  is_min_variance: boolean;
  is_max_sharpe: boolean;
  computed_at: Date;
}

// For the Recharts ComposedChart
export interface NMEChartPoint {
  nme_id: string;
  nme_name: string;
  nme_code: string;
  therapeutic_area: string;
  tier: string;
  x: number;           // risk_score
  y: number;           // return_score
  sharpe_ratio: number;
  optimal_weight: number;
  min_var_weight: number;
  is_frontier: boolean;
  total_bac: number;
}

export interface FrontierLinePoint {
  x: number;           // portfolio_risk
  y: number;           // portfolio_return
  is_min_variance: boolean;
  is_max_sharpe: boolean;
}
