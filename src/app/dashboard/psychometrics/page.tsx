import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { SkillsRadarChart } from "@/components/psychometrics/SkillsRadarChart";
import { FeatureDistributionChart } from "@/components/psychometrics/FeatureDistributionChart";
import { ConfusionMatrixChart } from "@/components/psychometrics/ConfusionMatrixChart";
import { TrainingHistoryChart } from "@/components/psychometrics/TrainingHistoryChart";
import { CandidatePredictor } from "@/components/psychometrics/CandidatePredictor";
import {
  generateSyntheticData,
  calculateFeatureStats,
  generateConfusionMatrix,
  calculateModelMetrics,
  generateTrainingHistory,
} from "@/lib/psychometrics";
import { Users, UserCheck, UserX, Brain } from "lucide-react";

export default function PsychometricsPage() {
  // Generate data (matching notebook's synthetic data)
  const candidateData = generateSyntheticData(1000, 42);
  const featureStats = calculateFeatureStats(candidateData);
  const confusionMatrix = generateConfusionMatrix(candidateData);
  const modelMetrics = calculateModelMetrics(confusionMatrix);
  const trainingHistory = generateTrainingHistory(20);

  // Summary stats
  const totalCandidates = candidateData.length;
  const suitableCandidates = candidateData.filter(c => c.suitable).length;
  const unsuitableCandidates = totalCandidates - suitableCandidates;
  const suitabilityRate = Math.round((suitableCandidates / totalCandidates) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Psychometric Analysis Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Deep learning model for Clinical Research Scientist candidate selection
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Candidates"
          value={totalCandidates}
          subtitle="Evaluated candidates"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <SummaryCard
          title="Suitable"
          value={suitableCandidates}
          subtitle={`${suitabilityRate}% of total`}
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <SummaryCard
          title="Unsuitable"
          value={unsuitableCandidates}
          subtitle={`${100 - suitabilityRate}% of total`}
          icon={UserX}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <SummaryCard
          title="Model Accuracy"
          value={modelMetrics.accuracy}
          subtitle="Test set performance"
          icon={Brain}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
      </div>

      {/* Skills Profile Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Skills Radar Profile</h2>
          <p className="text-xs text-gray-400 mb-4">
            Average scores comparison between suitable and unsuitable candidates
          </p>
          <SkillsRadarChart stats={featureStats} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Feature Distribution by Outcome</h2>
          <p className="text-xs text-gray-400 mb-4">
            Mean feature values for each candidate group
          </p>
          <FeatureDistributionChart stats={featureStats} />
        </div>
      </div>

      {/* Model Performance */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Model Performance - Confusion Matrix</h2>
        <p className="text-xs text-gray-400 mb-4">
          Classification results on test set (20% of data)
        </p>
        <ConfusionMatrixChart matrix={confusionMatrix} metrics={modelMetrics} />
      </div>

      {/* Training History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Training Accuracy</h2>
          <p className="text-xs text-gray-400 mb-2">
            Model learning progress over epochs
          </p>
          <TrainingHistoryChart history={trainingHistory} type="accuracy" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Training Loss</h2>
          <p className="text-xs text-gray-400 mb-2">
            Binary cross-entropy loss over epochs
          </p>
          <TrainingHistoryChart history={trainingHistory} type="loss" />
        </div>
      </div>

      {/* Feature Statistics Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700">Feature Statistics</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Psychometric features used in the selection model
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Feature</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">Range</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">Mean</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">Std Dev</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">
                  <span className="text-emerald-600">Suitable</span> Avg
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">
                  <span className="text-red-600">Unsuitable</span> Avg
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {featureStats.map((stat) => (
                <tr key={stat.name} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{stat.displayName}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 text-center">{stat.min} - {stat.max}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 text-center">{stat.mean}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 text-center">{stat.std}</td>
                  <td className="px-5 py-3 text-sm text-center">
                    <span className="font-semibold text-emerald-600">{stat.suitableMean}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-center">
                    <span className="font-semibold text-red-600">{stat.unsuitableMean}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Predictor */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Candidate Suitability Predictor</h2>
        <p className="text-xs text-gray-400 mb-4">
          Enter candidate psychometric scores to predict suitability for Clinical Research Scientist role
        </p>
        <CandidatePredictor />
      </div>

      {/* Model Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Model Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            label="Architecture"
            value="Sequential Neural Network"
            description="Dense layers with dropout"
          />
          <InfoCard
            label="Layers"
            value="Dense(64) → Dense(32) → Dense(1)"
            description="ReLU activation, sigmoid output"
          />
          <InfoCard
            label="Optimizer"
            value="Adam"
            description="Learning rate: 0.001"
          />
          <InfoCard
            label="Loss Function"
            value="Binary Cross-Entropy"
            description="For binary classification"
          />
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Selection Criteria (Score Calculation)</h3>
          <code className="text-sm text-gray-700 font-mono">
            Score = (Analytical Thinking × 1.5) + (Research Experience × 0.8) + (Attention to Detail × 1.2)
          </code>
          <p className="text-xs text-gray-500 mt-2">
            Candidates with Score &gt; 25 are classified as suitable
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  );
}
