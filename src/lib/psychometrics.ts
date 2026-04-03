// Psychometric data types and utilities for Clinical Research Scientist selection

export interface PsychometricFeatures {
  attentionToDetail: number;
  analyticalThinking: number;
  ethicalReasoning: number;
  stressTolerance: number;
  communicationSkills: number;
  teamworkOrientation: number;
  researchExperience: number;
  problemSolving: number;
  conscientiousness: number;
  openness: number;
}

export interface CandidateData extends PsychometricFeatures {
  id: number;
  suitable: boolean;
  score: number;
}

export interface FeatureStats {
  name: string;
  displayName: string;
  min: number;
  max: number;
  mean: number;
  std: number;
  suitableMean: number;
  unsuitableMean: number;
}

export interface ConfusionMatrixData {
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  specificity: number;
}

export interface TrainingHistory {
  epoch: number;
  accuracy: number;
  valAccuracy: number;
  loss: number;
  valLoss: number;
}

// Seeded random number generator for reproducibility
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate synthetic psychometric data matching the notebook
export function generateSyntheticData(nSamples: number = 1000, seed: number = 42): CandidateData[] {
  const data: CandidateData[] = [];

  for (let i = 0; i < nSamples; i++) {
    const localSeed = seed + i * 10;

    const candidate: CandidateData = {
      id: i + 1,
      attentionToDetail: Math.floor(seededRandom(localSeed) * 6) + 5, // 5-10
      analyticalThinking: Math.floor(seededRandom(localSeed + 1) * 7) + 4, // 4-10
      ethicalReasoning: Math.floor(seededRandom(localSeed + 2) * 5) + 6, // 6-10
      stressTolerance: Math.floor(seededRandom(localSeed + 3) * 8) + 3, // 3-10
      communicationSkills: Math.floor(seededRandom(localSeed + 4) * 6) + 5, // 5-10
      teamworkOrientation: Math.floor(seededRandom(localSeed + 5) * 7) + 4, // 4-10
      researchExperience: Math.floor(seededRandom(localSeed + 6) * 15), // 0-14
      problemSolving: Math.floor(seededRandom(localSeed + 7) * 7) + 4, // 4-10
      conscientiousness: Math.floor(seededRandom(localSeed + 8) * 6) + 5, // 5-10
      openness: Math.floor(seededRandom(localSeed + 9) * 7) + 4, // 4-10
      suitable: false,
      score: 0,
    };

    // Calculate suitability score matching the notebook logic
    candidate.score =
      candidate.analyticalThinking * 1.5 +
      candidate.researchExperience * 0.8 +
      candidate.attentionToDetail * 1.2;
    candidate.suitable = candidate.score > 25;

    data.push(candidate);
  }

  return data;
}

// Calculate feature statistics
export function calculateFeatureStats(data: CandidateData[]): FeatureStats[] {
  const features: (keyof PsychometricFeatures)[] = [
    'attentionToDetail',
    'analyticalThinking',
    'ethicalReasoning',
    'stressTolerance',
    'communicationSkills',
    'teamworkOrientation',
    'researchExperience',
    'problemSolving',
    'conscientiousness',
    'openness',
  ];

  const displayNames: Record<string, string> = {
    attentionToDetail: 'Attention to Detail',
    analyticalThinking: 'Analytical Thinking',
    ethicalReasoning: 'Ethical Reasoning',
    stressTolerance: 'Stress Tolerance',
    communicationSkills: 'Communication',
    teamworkOrientation: 'Teamwork',
    researchExperience: 'Research Exp. (yrs)',
    problemSolving: 'Problem Solving',
    conscientiousness: 'Conscientiousness',
    openness: 'Openness',
  };

  const suitableCandidates = data.filter(d => d.suitable);
  const unsuitableCandidates = data.filter(d => !d.suitable);

  return features.map(feature => {
    const values = data.map(d => d[feature]);
    const suitableValues = suitableCandidates.map(d => d[feature]);
    const unsuitableValues = unsuitableCandidates.map(d => d[feature]);

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;

    return {
      name: feature,
      displayName: displayNames[feature],
      min: Math.min(...values),
      max: Math.max(...values),
      mean: Math.round(mean * 100) / 100,
      std: Math.round(Math.sqrt(variance) * 100) / 100,
      suitableMean: suitableValues.length > 0
        ? Math.round((suitableValues.reduce((a, b) => a + b, 0) / suitableValues.length) * 100) / 100
        : 0,
      unsuitableMean: unsuitableValues.length > 0
        ? Math.round((unsuitableValues.reduce((a, b) => a + b, 0) / unsuitableValues.length) * 100) / 100
        : 0,
    };
  });
}

// Simulate confusion matrix from model predictions
export function generateConfusionMatrix(data: CandidateData[], testRatio: number = 0.2): ConfusionMatrixData {
  const testSize = Math.floor(data.length * testRatio);
  const testData = data.slice(-testSize);

  // Simulate model predictions with ~85% accuracy
  let tp = 0, tn = 0, fp = 0, fn = 0;

  testData.forEach((candidate, i) => {
    const seed = 1234 + i;
    const correct = seededRandom(seed) < 0.85;

    if (candidate.suitable) {
      if (correct) tp++;
      else fn++;
    } else {
      if (correct) tn++;
      else fp++;
    }
  });

  return { truePositive: tp, trueNegative: tn, falsePositive: fp, falseNegative: fn };
}

// Calculate model performance metrics from confusion matrix
export function calculateModelMetrics(cm: ConfusionMatrixData): ModelMetrics {
  const { truePositive: tp, trueNegative: tn, falsePositive: fp, falseNegative: fn } = cm;
  const total = tp + tn + fp + fn;

  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const f1Score = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  const specificity = (tn + fp) > 0 ? tn / (tn + fp) : 0;

  return {
    accuracy: Math.round(accuracy * 1000) / 10,
    precision: Math.round(precision * 1000) / 10,
    recall: Math.round(recall * 1000) / 10,
    f1Score: Math.round(f1Score * 1000) / 10,
    specificity: Math.round(specificity * 1000) / 10,
  };
}

// Generate simulated training history
export function generateTrainingHistory(epochs: number = 20): TrainingHistory[] {
  const history: TrainingHistory[] = [];

  for (let epoch = 1; epoch <= epochs; epoch++) {
    const progress = epoch / epochs;
    const noise = seededRandom(epoch * 100) * 0.05;

    history.push({
      epoch,
      accuracy: Math.min(0.95, 0.50 + progress * 0.40 + noise),
      valAccuracy: Math.min(0.90, 0.45 + progress * 0.35 + noise * 1.5),
      loss: Math.max(0.15, 0.80 - progress * 0.55 - noise),
      valLoss: Math.max(0.20, 0.85 - progress * 0.45 - noise * 0.8),
    });
  }

  return history;
}

// Predict suitability for a new candidate
export function predictSuitability(features: PsychometricFeatures): { probability: number; suitable: boolean } {
  const score =
    features.analyticalThinking * 1.5 +
    features.researchExperience * 0.8 +
    features.attentionToDetail * 1.2;

  // Simulate sigmoid-like probability
  const normalized = (score - 15) / 20; // Normalize around threshold
  const probability = 1 / (1 + Math.exp(-normalized * 3));

  return {
    probability: Math.round(probability * 100) / 100,
    suitable: probability > 0.5,
  };
}

// Get distribution data for a feature
export function getFeatureDistribution(data: CandidateData[], feature: keyof PsychometricFeatures): { value: number; suitable: number; unsuitable: number }[] {
  const distribution: Map<number, { suitable: number; unsuitable: number }> = new Map();

  data.forEach(candidate => {
    const value = candidate[feature];
    const existing = distribution.get(value) || { suitable: 0, unsuitable: 0 };
    if (candidate.suitable) {
      existing.suitable++;
    } else {
      existing.unsuitable++;
    }
    distribution.set(value, existing);
  });

  return Array.from(distribution.entries())
    .map(([value, counts]) => ({ value, ...counts }))
    .sort((a, b) => a.value - b.value);
}

// Chart colors
export const PSYCHOMETRIC_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  suitable: '#10b981',
  unsuitable: '#ef4444',
  features: [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#06b6d4', '#f97316', '#84cc16', '#a855f7', '#14b8a6'
  ],
};
