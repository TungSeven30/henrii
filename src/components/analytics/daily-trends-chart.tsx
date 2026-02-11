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

export type DailyTrendPoint = {
  day: string;
  feeds: number;
  sleepSessions: number;
  diapers: number;
};

type DailyTrendsChartProps = {
  data: DailyTrendPoint[];
  labels: {
    feeds: string;
    sleep: string;
    diapers: string;
    empty: string;
  };
};

export function DailyTrendsChart({ data, labels }: DailyTrendsChartProps) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">{labels.empty}</p>;
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="feeds"
            name={labels.feeds}
            stroke="var(--chart-1, #f8b4c8)"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="sleepSessions"
            name={labels.sleep}
            stroke="var(--chart-2, #b4d8f8)"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="diapers"
            name={labels.diapers}
            stroke="var(--chart-3, #f8e4b4)"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
