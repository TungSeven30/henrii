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
  ageMonths: number;
  measuredValue?: number | null;
  measuredPercentile?: number | null;
  date?: string | null;
  p3?: number | null;
  p15?: number | null;
  p50?: number | null;
  p85?: number | null;
  p97?: number | null;
};

type PercentileCurvesChartProps = {
  data: PercentileCurvePoint[];
  labels: {
    title: string;
    subtitle: string;
    valueSeriesLabel: string;
    unit: string;
    p3: string;
    p15: string;
    p50: string;
    p85: string;
    p97: string;
    empty: string;
  };
};

type RechartsTooltipPayload = {
  active?: boolean;
  payload?: Array<{
    payload: PercentileCurvePoint;
    name?: string;
    value?: unknown;
  }>;
  label?: unknown;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: PercentileCurvePoint;
    name?: string;
    value?: unknown;
  }>;
  label?: unknown;
  valueSeriesLabel: string;
  unit: string;
  p3: string;
  p15: string;
  p50: string;
  p85: string;
  p97: string;
};

function formatValue(value: unknown, unit: string, digits = 1) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return `${value.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
}

function formatMonthLabel(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return `${value.toFixed(1)} mo`;
}

function ChartTooltip({
  active,
  payload,
  label,
  valueSeriesLabel,
  unit,
  p3,
  p15,
  p50,
  p85,
  p97,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  const hasMeasurement =
    typeof point.measuredValue === "number" && Number.isFinite(point.measuredValue);

  return (
    <div className="border border-border rounded-md bg-card p-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{formatMonthLabel(label)}</p>
      {point.date ? <p className="text-muted-foreground">{point.date}</p> : null}
      <p>
        {valueSeriesLabel}:{" "}
        {hasMeasurement ? formatValue(point.measuredValue, unit) : "—"}
      </p>
      {typeof point.measuredPercentile === "number" ? (
        <p className="text-muted-foreground">
          {point.measuredPercentile.toFixed(0)}th
        </p>
      ) : null}
      {typeof point.p3 === "number" ? (
        <p className="text-muted-foreground">
          {p3}: {formatValue(point.p3, unit)}
        </p>
      ) : null}
      {typeof point.p15 === "number" ? (
        <p className="text-muted-foreground">
          {p15}: {formatValue(point.p15, unit)}
        </p>
      ) : null}
      {typeof point.p50 === "number" ? (
        <p className="text-muted-foreground">
          {p50}: {formatValue(point.p50, unit)}
        </p>
      ) : null}
      {typeof point.p85 === "number" ? (
        <p className="text-muted-foreground">
          {p85}: {formatValue(point.p85, unit)}
        </p>
      ) : null}
      {typeof point.p97 === "number" ? (
        <p className="text-muted-foreground">
          {p97}: {formatValue(point.p97, unit)}
        </p>
      ) : null}
    </div>
  );
}

function axisMin(points: PercentileCurvePoint[]): number {
  const numeric = points.flatMap((point) => {
    const values = [point.measuredValue, point.p3, point.p15, point.p50, point.p85, point.p97];
    return values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  });

  if (!numeric.length) {
    return 0;
  }

  return Math.floor(Math.min(...numeric) * 0.95);
}

function axisMax(points: PercentileCurvePoint[]): number {
  const numeric = points.flatMap((point) => {
    const values = [point.measuredValue, point.p3, point.p15, point.p50, point.p85, point.p97];
    return values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  });

  if (!numeric.length) {
    return 100;
  }

  return Math.ceil(Math.max(...numeric) * 1.05);
}

function isNonEmpty(point: PercentileCurvePoint) {
  return (
    point.measuredValue !== null &&
    point.measuredValue !== undefined &&
    typeof point.measuredValue === "number"
  );
}

export function PercentileCurvesChart({
  data,
  labels,
}: PercentileCurvesChartProps) {
  const dataHasPoints = data.some(
    (point) =>
      isNonEmpty(point) ||
      point.p3 !== undefined ||
      point.p15 !== undefined ||
      point.p50 !== undefined ||
      point.p85 !== undefined ||
      point.p97 !== undefined,
  );
  const yMin = dataHasPoints ? axisMin(data) : 0;
  const yMax = dataHasPoints ? axisMax(data) : 100;

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="font-heading text-xl font-semibold">{labels.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{labels.subtitle}</p>

      {!dataHasPoints ? (
        <p className="mt-4 text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ageMonths" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 12 }}
                unit={labels.unit}
                allowDataOverflow
              />
              <Tooltip
                content={(chartProps) => (
                  <ChartTooltip
                    {...(chartProps as unknown as RechartsTooltipPayload)}
                    valueSeriesLabel={labels.valueSeriesLabel}
                    unit={labels.unit}
                    p3={labels.p3}
                    p15={labels.p15}
                    p50={labels.p50}
                    p85={labels.p85}
                    p97={labels.p97}
                  />
                )}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="p97"
                name={labels.p97}
                stroke="var(--muted-foreground)"
                strokeWidth={1}
                strokeDasharray="6 3"
                strokeOpacity={0.35}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="p85"
                name={labels.p85}
                stroke="var(--muted-foreground)"
                strokeWidth={1}
                strokeDasharray="4 4"
                strokeOpacity={0.2}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="p50"
                name={labels.p50}
                stroke="var(--muted-foreground)"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                strokeOpacity={0.45}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="p15"
                name={labels.p15}
                stroke="var(--muted-foreground)"
                strokeWidth={1}
                strokeDasharray="4 4"
                strokeOpacity={0.2}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="p3"
                name={labels.p3}
                stroke="var(--muted-foreground)"
                strokeWidth={1}
                strokeDasharray="6 3"
                strokeOpacity={0.35}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="measuredValue"
                name={labels.valueSeriesLabel}
                stroke="var(--henrii-purple)"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
