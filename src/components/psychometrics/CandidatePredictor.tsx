"use client";

import { useState } from "react";
import { predictSuitability, type PsychometricFeatures, PSYCHOMETRIC_COLORS } from "@/lib/psychometrics";
import { cn } from "@/lib/utils";

const featureConfig = [
  { key: 'attentionToDetail', label: 'Attention to Detail', min: 5, max: 10 },
  { key: 'analyticalThinking', label: 'Analytical Thinking', min: 4, max: 10 },
  { key: 'ethicalReasoning', label: 'Ethical Reasoning', min: 6, max: 10 },
  { key: 'stressTolerance', label: 'Stress Tolerance', min: 3, max: 10 },
  { key: 'communicationSkills', label: 'Communication Skills', min: 5, max: 10 },
  { key: 'teamworkOrientation', label: 'Teamwork Orientation', min: 4, max: 10 },
  { key: 'researchExperience', label: 'Research Experience (years)', min: 0, max: 15 },
  { key: 'problemSolving', label: 'Problem Solving', min: 4, max: 10 },
  { key: 'conscientiousness', label: 'Conscientiousness', min: 5, max: 10 },
  { key: 'openness', label: 'Openness', min: 4, max: 10 },
] as const;

const defaultValues: PsychometricFeatures = {
  attentionToDetail: 7,
  analyticalThinking: 7,
  ethicalReasoning: 8,
  stressTolerance: 6,
  communicationSkills: 7,
  teamworkOrientation: 7,
  researchExperience: 5,
  problemSolving: 7,
  conscientiousness: 7,
  openness: 7,
};

export function CandidatePredictor() {
  const [features, setFeatures] = useState<PsychometricFeatures>(defaultValues);
  const [prediction, setPrediction] = useState<{ probability: number; suitable: boolean } | null>(null);

  const handleChange = (key: keyof PsychometricFeatures, value: number) => {
    setFeatures(prev => ({ ...prev, [key]: value }));
    setPrediction(null);
  };

  const handlePredict = () => {
    const result = predictSuitability(features);
    setPrediction(result);
  };

  const handleReset = () => {
    setFeatures(defaultValues);
    setPrediction(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featureConfig.map(({ key, label, min, max }) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <span className="text-sm font-bold text-gray-900">{features[key]}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={features[key]}
              onChange={(e) => handleChange(key, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePredict}
          className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Predict Suitability
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Prediction Result */}
      {prediction && (
        <div
          className={cn(
            "rounded-xl p-6 text-center",
            prediction.suitable ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
          )}
        >
          <div className="mb-3">
            <span
              className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold",
                prediction.suitable ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              )}
            >
              {prediction.suitable ? "Suitable Candidate" : "Unsuitable Candidate"}
            </span>
          </div>

          {/* Probability gauge */}
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Unsuitable</span>
              <span>Suitable</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${prediction.probability * 100}%`,
                  backgroundColor: prediction.suitable ? PSYCHOMETRIC_COLORS.suitable : PSYCHOMETRIC_COLORS.unsuitable,
                }}
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {(prediction.probability * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">Selection Probability</p>
          </div>
        </div>
      )}
    </div>
  );
}
