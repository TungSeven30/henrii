"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PercentileCurvePoint = {
  date: string;
  label: string;
  weightPercentile: number | null;
  lengthPercentile: number | null;
  headPercentile: number | null;
};

type PercentileCurvesChartProps = {
  data: PercentileCurvePoint[];
  labels: {
    title: string;
    subtitle: string;
    weight: string;
    length: string;
    head: string;
    empty: string;
  };
};

function tooltipValueFormatter(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

export function PercentileCurvesChart({
  data,
  labels,
}: PercentileCurvesChartProps) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="font-heading text-xl font-semibold">{labels.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{labels.subtitle}</p>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                tickCount={6}
                tick={{ fontSize: 12 }}
                unit="%"
              />
              <Tooltip
                formatter={tooltipValueFormatter}
                labelFormatter={(value) => `${value}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="weightPercentile"
                name={labels.weight}
                stroke="var(--chart-1, #f8b4c8)"
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="lengthPercentile"
                name={labels.length}
                stroke="var(--chart-2, #b4d8f8)"
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="headPercentile"
                name={labels.head}
                stroke="var(--chart-3, #f8e4b4)"
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
