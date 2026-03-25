export interface ProjectEVMRow {
  project_id: string;
  project_code: string;
  project_name: string;
  project_status: string;
  plannedStart: Date;
  plannedEnd: Date;
  actualStart: Date | null;
  actualEnd: Date | null;
  pct_complete: number;
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
  total_estimated_hours: number;
  total_actual_hours: number;
  task_count: number;
  completed_tasks: number;
  task_completion_pct: number | null;
  // Computed in application
  sv: number;
  cv: number;
  spi: number;
  cpi: number;
  eac: number;
  etc: number;
  vac: number;
  tcpi: number;
}

export interface NMEEVMRow {
  nme_id: string;
  nme_name: string;
  nme_code: string;
  therapeutic_area: string;
  nme_status: string;
  project_count: number;
  total_bac: number;
  total_pv: number;
  total_ev: number;
  total_ac: number;
  portfolio_spi: number | null;
  portfolio_cpi: number | null;
  portfolio_eac: number | null;
  portfolio_vac: number | null;
  total_estimated_hours: number;
  total_actual_hours: number;
  total_tasks: number;
  total_completed_tasks: number;
  task_completion_pct: number | null;
}

export interface RoleContributionRow {
  trial_id: string;
  nct_number: string;
  trial_phase: string;
  trial_status: string;
  nme_name: string;
  nme_code: string;
  therapeutic_area: string;
  role: string;
  staff_count: number;
  total_fte_effort: number;
  avg_fte_effort: number;
  task_count: number;
  completed_tasks: number;
  open_tasks: number;
  blocked_tasks: number;
  estimated_hours: number;
  actual_hours: number;
  task_completion_pct: number | null;
}

// Aggregated by role across all trials
export interface RoleSummary {
  role: string;
  total_staff: number;
  total_trials: number;
  total_fte_effort: number;
  avg_fte_effort: number;
  total_tasks: number;
  completed_tasks: number;
  open_tasks: number;
  blocked_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  task_completion_pct: number;
}

export function computeEVMDerived(row: {
  bac: number; pv: number; ev: number; ac: number;
}): { sv: number; cv: number; spi: number; cpi: number; eac: number; etc: number; vac: number; tcpi: number } {
  const bac = Number(row.bac);
  const pv = Number(row.pv);
  const ev = Number(row.ev);
  const ac = Number(row.ac);

  const spi = pv > 0 ? ev / pv : 1;
  const cpi = ac > 0 ? ev / ac : 1;
  const eac = cpi > 0 ? bac / cpi : bac;
  const etc = eac - ac;
  const vac = bac - eac;
  const tcpi = (bac - ac) > 0 ? (bac - ev) / (bac - ac) : 1;

  return {
    sv: ev - pv,
    cv: ev - ac,
    spi,
    cpi,
    eac,
    etc,
    vac,
    tcpi,
  };
}
