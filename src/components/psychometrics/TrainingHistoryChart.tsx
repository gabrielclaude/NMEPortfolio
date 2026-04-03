"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TrainingHistory } from "@/lib/psychometrics";
import { PSYCHOMETRIC_COLORS } from "@/lib/psychometrics";

interface TrainingHistoryChartProps {
  history: TrainingHistory[];
  type: 'accuracy' | 'loss';
}

export function TrainingHistoryChart({ history, type }: TrainingHistoryChartProps) {
  const isAccuracy = type === 'accuracy';

  const chartData = history.map(h => ({
    epoch: h.epoch,
    training: isAccuracy ? h.accuracy * 100 : h.loss,
    validation: isAccuracy ? h.valAccuracy * 100 : h.valLoss,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="epoch"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          label={{ value: 'Epoch', position: 'bottom', offset: -5, fontSize: 11, fill: '#6b7280' }}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          domain={isAccuracy ? [40, 100] : [0, 1]}
          label={{
            value: isAccuracy ? 'Accuracy (%)' : 'Loss',
            angle: -90,
            position: 'insideLeft',
            fontSize: 11,
            fill: '#6b7280',
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value) => {
            const numValue = typeof value === 'number' ? value : 0;
            return [isAccuracy ? `${numValue.toFixed(1)}%` : numValue.toFixed(3), ''];
          }}
          labelFormatter={(label) => `Epoch ${label}`}
        />
        <Legend
          wrapperStyle={{ paddingTop: 10 }}
          formatter={(value) => (
            <span className="text-xs text-gray-600">{value}</span>
          )}
        />
        <Line
          type="monotone"
          dataKey="training"
          name={`Training ${isAccuracy ? 'Accuracy' : 'Loss'}`}
          stroke={PSYCHOMETRIC_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: PSYCHOMETRIC_COLORS.primary, strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="validation"
          name={`Validation ${isAccuracy ? 'Accuracy' : 'Loss'}`}
          stroke={PSYCHOMETRIC_COLORS.secondary}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: PSYCHOMETRIC_COLORS.secondary, strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
