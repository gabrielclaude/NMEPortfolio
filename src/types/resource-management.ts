// Types for the Resource Management module

export interface RMStudy {
  id: string;
  phase: number;
  status: string;
  complexity: string;
}

export interface RMStudySegment {
  id: number;
  study_id: string;
  activity: string;
  start_date: Date;
  end_date: Date;
  complexity: string;
  role: string;
  phase: number;
  days: number;
  fte_per_month: number;
}

export interface RMPersonnel {
  id: number;
  name: string;
  total_allocation: number;
  adjustment: number;
}

export interface RMStaffAssignment {
  study_id: string;
  personnel_name: string;
  role: string;
  allocation_pct: number;
}

export interface RMFteMatrix {
  complexity: string;
  role: string;
  phase: number;
  activity: string;
  fte_per_month: number;
}

// For the monthly demand chart (v_rm_monthly_by_role)
export interface MonthlyRoleDemand {
  month_date: Date;
  month_label: string;
  role: string;
  fte_demand: number;
}

// Pivoted chart row: one row per month, columns per role
export interface MonthlyDemandChartRow {
  month_label: string;
  month_date: string;          // ISO string for sorting
  "Clinical Scientist": number;
  "Medical Monitor": number;
  "Clinical RA": number;
  total: number;
}

// Summary cards
export interface RMSummary {
  total_studies: number;
  total_segments: number;
  total_personnel: number;
  total_assignments: number;
  peak_month_label: string;
  peak_fte: number;
  current_month_fte: number;
}

// ─── NME Resource Management Types ────────────────────────────────────────────

// Study with NME assignment
export interface RMStudyWithNME extends RMStudy {
  nme_id: string | null;
}

// NME-specific monthly demand (from v_rm_monthly_by_nme)
export interface NMEMonthlyRoleDemand {
  month_date: Date;
  month_label: string;
  nme_id: string;
  role: string;
  fte_demand: number;
}

// NME RM summary for dashboard cards
export interface NMERMSummary {
  nme_id: string;
  nme_code: string;
  nme_name: string;
  study_count: number;
  total_fte_demand: number;
  peak_month_label: string;
  peak_fte: number;
  current_month_fte: number;
}

// NME option for selector dropdown
export interface NMEOption {
  id: string;
  code: string;
  name: string;
}
