// Color maps for all status/phase/role enums → Tailwind classes

export const NME_STATUS_COLORS: Record<string, string> = {
  PRECLINICAL:  "bg-gray-100 text-gray-700",
  IND_FILED:    "bg-slate-100 text-slate-700",
  PHASE_1:      "bg-sky-100 text-sky-700",
  PHASE_2:      "bg-violet-100 text-violet-700",
  PHASE_3:      "bg-amber-100 text-amber-700",
  PHASE_4:      "bg-emerald-100 text-emerald-700",
  NDA_FILED:    "bg-orange-100 text-orange-700",
  APPROVED:     "bg-green-100 text-green-700",
  DISCONTINUED: "bg-red-100 text-red-700",
  ON_HOLD:      "bg-yellow-100 text-yellow-700",
};

export const TRIAL_PHASE_COLORS: Record<string, string> = {
  PHASE_1:         "bg-sky-100 text-sky-700",
  PHASE_1B:        "bg-sky-200 text-sky-800",
  PHASE_2:         "bg-violet-100 text-violet-700",
  PHASE_2B:        "bg-violet-200 text-violet-800",
  PHASE_3:         "bg-amber-100 text-amber-700",
  PHASE_3B:        "bg-amber-200 text-amber-800",
  PHASE_4:         "bg-emerald-100 text-emerald-700",
  EXPANDED_ACCESS: "bg-teal-100 text-teal-700",
};

export const TRIAL_STATUS_COLORS: Record<string, string> = {
  PLANNING:            "bg-slate-100 text-slate-700",
  RECRUITING:          "bg-blue-100 text-blue-700",
  ACTIVE:              "bg-green-100 text-green-700",
  ENROLLMENT_COMPLETE: "bg-indigo-100 text-indigo-700",
  COMPLETED:           "bg-emerald-100 text-emerald-700",
  SUSPENDED:           "bg-yellow-100 text-yellow-700",
  TERMINATED:          "bg-red-100 text-red-700",
  WITHDRAWN:           "bg-gray-100 text-gray-600",
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_HOLD:     "bg-yellow-100 text-yellow-700",
  COMPLETED:   "bg-emerald-100 text-emerald-700",
  CANCELLED:   "bg-gray-200 text-gray-500",
  AT_RISK:     "bg-red-100 text-red-700",
};

export const MILESTONE_STATUS_COLORS: Record<string, string> = {
  PENDING:     "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-emerald-100 text-emerald-700",
  DELAYED:     "bg-red-100 text-red-700",
  SKIPPED:     "bg-gray-100 text-gray-400",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  BACKLOG:    "bg-gray-100 text-gray-500",
  TODO:       "bg-slate-100 text-slate-700",
  IN_PROGRESS:"bg-blue-100 text-blue-700",
  IN_REVIEW:  "bg-purple-100 text-purple-700",
  DONE:       "bg-emerald-100 text-emerald-700",
  BLOCKED:    "bg-red-100 text-red-700",
  CANCELLED:  "bg-gray-100 text-gray-400",
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW:      "bg-slate-100 text-slate-600",
  MEDIUM:   "bg-yellow-100 text-yellow-700",
  HIGH:     "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export const STAFF_ROLE_COLORS: Record<string, string> = {
  PRINCIPAL_SCIENTIST:       "bg-indigo-100 text-indigo-700",
  MEDICAL_MONITOR:           "bg-teal-100 text-teal-700",
  RESEARCH_ASSOCIATE:        "bg-sky-100 text-sky-700",
  CLINICAL_OPERATIONS_MANAGER: "bg-violet-100 text-violet-700",
  DATA_MANAGER:              "bg-amber-100 text-amber-700",
  BIOSTATISTICIAN:           "bg-pink-100 text-pink-700",
  REGULATORY_AFFAIRS:        "bg-orange-100 text-orange-700",
  PROJECT_MANAGER:           "bg-emerald-100 text-emerald-700",
};

export const THERAPEUTIC_AREA_COLORS: Record<string, string> = {
  ONCOLOGY:           "#ef4444",
  CARDIOVASCULAR:     "#3b82f6",
  NEUROLOGY:          "#8b5cf6",
  IMMUNOLOGY:         "#f59e0b",
  INFECTIOUS_DISEASE: "#10b981",
  METABOLIC:          "#f97316",
  RESPIRATORY:        "#06b6d4",
  RARE_DISEASE:       "#ec4899",
  OPHTHALMOLOGY:      "#84cc16",
  DERMATOLOGY:        "#a855f7",
};

export const PHASE_CHART_COLORS: Record<string, string> = {
  PHASE_1:  "#38bdf8",
  PHASE_1B: "#0ea5e9",
  PHASE_2:  "#a78bfa",
  PHASE_2B: "#7c3aed",
  PHASE_3:  "#fbbf24",
  PHASE_3B: "#d97706",
  PHASE_4:  "#34d399",
  EXPANDED_ACCESS: "#2dd4bf",
};

export function formatEnumLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
