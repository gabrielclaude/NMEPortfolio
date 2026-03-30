"use client";

import { useState, useMemo } from "react";
import {
  Brain,
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  LineChart,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PredictionScatterChart } from "./PredictionScatterChart";
import { FeatureImportanceChart } from "./FeatureImportanceChart";
import { ResidualHistogram } from "./ResidualHistogram";
import { PredictionTable } from "./PredictionTable";
import { ModelMetricsCards } from "./ModelMetricsCards";

interface ProjectData {
  project_id: string;
  project_name: string;
  nme_name: string;
  therapeutic_area: string;
  nme_status: string;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  percent_complete: number;
}

interface EVMPredictionDashboardProps {
  projectData: ProjectData[];
}

// Simulated neural network prediction function
// In production, this would call your TensorFlow model API
function predictEV(project: ProjectData): number {
  const { bac, pv, ac, percent_complete } = project;

  // Simulated neural network prediction
  // Base prediction from percent complete
  let baseEV = bac * (percent_complete / 100);

  // Adjust based on SPI trend (if pv > 0)
  const spi = pv > 0 ? baseEV / pv : 1;

  // Adjust based on CPI trend (if ac > 0)
  const cpi = ac > 0 ? baseEV / ac : 1;

  // Neural network "learned" adjustment factors
  const scheduleAdjustment = Math.tanh((spi - 1) * 0.5) * 0.1;
  const costAdjustment = Math.tanh((cpi - 1) * 0.3) * 0.08;

  // Apply adjustments
  const predictedEV = baseEV * (1 + scheduleAdjustment + costAdjustment);

  // Add small random variation to simulate model uncertainty
  const noise = (Math.random() - 0.5) * 0.05 * baseEV;

  return Math.max(0, predictedEV + noise);
}

// Feature importance from the model (simulated)
const featureImportance = [
  { feature: "Planned Value (PV)", importance: 0.28, description: "Budgeted cost of work scheduled" },
  { feature: "Budget at Completion (BAC)", importance: 0.24, description: "Total project budget" },
  { feature: "% Complete", importance: 0.18, description: "Physical completion percentage" },
  { feature: "Actual Cost (AC)", importance: 0.12, description: "Actual expenditure to date" },
  { feature: "Prior SPI", importance: 0.08, description: "Historical schedule performance" },
  { feature: "Prior CPI", importance: 0.05, description: "Historical cost performance" },
  { feature: "Schedule Variance", importance: 0.03, description: "Prior period SV" },
  { feature: "Cost Variance", importance: 0.02, description: "Prior period CV" },
];

export function EVMPredictionDashboard({ projectData }: EVMPredictionDashboardProps) {
  const [selectedArea, setSelectedArea] = useState<string>("all");

  // Generate predictions for all projects
  const predictionsData = useMemo(() => {
    return projectData.map((project) => {
      const predicted = predictEV(project);
      const actual = project.ev;
      const residual = actual - predicted;
      const percentError = actual > 0 ? Math.abs(residual / actual) * 100 : 0;

      // Calculate predicted performance indices
      const predSPI = project.pv > 0 ? predicted / project.pv : 1;
      const predCPI = project.ac > 0 ? predicted / project.ac : 1;

      return {
        ...project,
        predicted_ev: predicted,
        actual_ev: actual,
        residual,
        percent_error: percentError,
        predicted_spi: predSPI,
        predicted_cpi: predCPI,
        status: predSPI >= 0.95 && predCPI >= 0.95 ? "on_track" :
                predSPI >= 0.80 && predCPI >= 0.80 ? "at_risk" : "critical",
      };
    });
  }, [projectData]);

  // Filter by therapeutic area
  const filteredData = useMemo(() => {
    if (selectedArea === "all") return predictionsData;
    return predictionsData.filter((p) => p.therapeutic_area === selectedArea);
  }, [predictionsData, selectedArea]);

  // Get unique therapeutic areas
  const therapeuticAreas = useMemo(() => {
    const areas = new Set(projectData.map((p) => p.therapeutic_area));
    return Array.from(areas).sort();
  }, [projectData]);

  // Calculate model metrics
  const metrics = useMemo(() => {
    const n = filteredData.length;
    if (n === 0) return { mae: 0, rmse: 0, r2: 0, mape: 0 };

    const residuals = filteredData.map((p) => p.residual);
    const actuals = filteredData.map((p) => p.actual_ev);
    const predicted = filteredData.map((p) => p.predicted_ev);

    // MAE
    const mae = residuals.reduce((sum, r) => sum + Math.abs(r), 0) / n;

    // RMSE
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / n;
    const rmse = Math.sqrt(mse);

    // R2
    const meanActual = actuals.reduce((sum, a) => sum + a, 0) / n;
    const ssRes = residuals.reduce((sum, r) => sum + r * r, 0);
    const ssTot = actuals.reduce((sum, a) => sum + (a - meanActual) ** 2, 0);
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    // MAPE
    const mape = actuals.reduce((sum, a, i) => {
      if (a === 0) return sum;
      return sum + Math.abs((a - predicted[i]) / a);
    }, 0) / actuals.filter((a) => a > 0).length * 100;

    return { mae, rmse, r2, mape };
  }, [filteredData]);

  // Summary counts
  const onTrackCount = filteredData.filter((p) => p.status === "on_track").length;
  const atRiskCount = filteredData.filter((p) => p.status === "at_risk").length;
  const criticalCount = filteredData.filter((p) => p.status === "critical").length;

  return (
    <div className="space-y-6">
      {/* Model Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-100 p-3">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">TensorFlow Neural Network Model</h2>
            <p className="text-sm text-gray-600 mt-1">
              Deep learning model predicting Earned Value (EV) using: PV, AC, BAC, % Complete,
              SPI, CPI, Schedule Variance, and Cost Variance features.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                <Zap className="h-3 w-3" /> Dense(128) → Dense(64) → Dense(32) → Dense(1)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                <Activity className="h-3 w-3" /> ReLU Activation
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                <Target className="h-3 w-3" /> MSE Loss
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Area Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Therapeutic Area:</label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Areas ({projectData.length})</option>
            {therapeuticAreas.map((area) => (
              <option key={area} value={area}>
                {area.replace(/_/g, " ")} ({projectData.filter((p) => p.therapeutic_area === area).length})
              </option>
            ))}
          </select>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-gray-700">{onTrackCount} On Track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">{atRiskCount} At Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">{criticalCount} Critical</span>
          </div>
        </div>
      </div>

      {/* Model Performance Metrics */}
      <ModelMetricsCards metrics={metrics} projectCount={filteredData.length} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predicted vs Actual Scatter */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-700">Predicted vs Actual EV</h3>
          </div>
          <PredictionScatterChart data={filteredData} />
        </div>

        {/* Feature Importance */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-700">Feature Importance</h3>
          </div>
          <FeatureImportanceChart features={featureImportance} />
        </div>

        {/* Residual Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-700">Residual Distribution</h3>
          </div>
          <ResidualHistogram data={filteredData} />
        </div>
      </div>

      {/* Predictions Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-700">Project Predictions</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Neural network predictions for each project with predicted SPI/CPI
          </p>
        </div>
        <PredictionTable data={filteredData} />
      </div>
    </div>
  );
}
