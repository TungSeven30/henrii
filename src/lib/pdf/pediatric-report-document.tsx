import { Document, Line, Page, Polyline, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    lineHeight: 1.4,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    color: "#555555",
    marginBottom: 12,
  },
  section: {
    marginBottom: 10,
    border: "1 solid #e5e7eb",
    borderRadius: 6,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  row: {
    marginBottom: 3,
  },
});

type DateRange = {
  start: string;
  end: string;
};

type GrowthPoint = {
  measured_at: string;
  weight_percentile: number | string | null;
  length_percentile: number | string | null;
  head_percentile: number | string | null;
};

const CHART_WIDTH = 300;
const CHART_HEIGHT = 110;

function clampPercentile(value: number | string | null) {
  if (value === null) {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.max(0, Math.min(100, numeric));
}

function toPolylinePoints(
  rows: GrowthPoint[],
  key: "weight_percentile" | "length_percentile" | "head_percentile",
) {
  const definedRows = rows.filter((row) => row[key] !== null);
  if (definedRows.length < 2) {
    return null;
  }

  const denominator = Math.max(rows.length - 1, 1);
  const points: string[] = [];

  rows.forEach((row, index) => {
    const percentile = clampPercentile(row[key]);
    if (percentile === null) {
      return;
    }

    const x = (index / denominator) * CHART_WIDTH;
    const y = CHART_HEIGHT - (percentile / 100) * CHART_HEIGHT;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  });

  return points.length >= 2 ? points.join(" ") : null;
}

export function PediatricReportDocument({
  babyName,
  range,
  summary,
  keyRows,
  growthTrend,
}: {
  babyName: string;
  range: DateRange;
  summary: {
    feedings: number;
    sleepSessions: number;
    diapers: number;
    vaccinationsCompleted: number;
    appointments: number;
  };
  keyRows: string[];
  growthTrend: GrowthPoint[];
}) {
  const weightLine = toPolylinePoints(growthTrend, "weight_percentile");
  const lengthLine = toPolylinePoints(growthTrend, "length_percentile");
  const headLine = toPolylinePoints(growthTrend, "head_percentile");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>henrii Pediatric Report</Text>
        <Text style={styles.subtitle}>
          Baby: {babyName} | Range: {range.start.slice(0, 10)} to {range.end.slice(0, 10)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.row}>Feedings: {summary.feedings}</Text>
          <Text style={styles.row}>Sleep sessions: {summary.sleepSessions}</Text>
          <Text style={styles.row}>Diaper changes: {summary.diapers}</Text>
          <Text style={styles.row}>Vaccinations completed: {summary.vaccinationsCompleted}</Text>
          <Text style={styles.row}>Appointments: {summary.appointments}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {keyRows.length ? (
            keyRows.map((row) => (
              <Text key={row} style={styles.row}>
                • {row}
              </Text>
            ))
          ) : (
            <Text style={styles.row}>No notable events in this period.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth percentiles trend</Text>
          {weightLine || lengthLine || headLine ? (
            <>
              <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 10}>
                <Line x1={0} y1={0} x2={0} y2={CHART_HEIGHT} stroke="#9ca3af" strokeWidth={1} />
                <Line
                  x1={0}
                  y1={CHART_HEIGHT}
                  x2={CHART_WIDTH}
                  y2={CHART_HEIGHT}
                  stroke="#9ca3af"
                  strokeWidth={1}
                />
                {weightLine ? (
                  <Polyline points={weightLine} stroke="#ec4899" strokeWidth={2} fill="none" />
                ) : null}
                {lengthLine ? (
                  <Polyline points={lengthLine} stroke="#3b82f6" strokeWidth={2} fill="none" />
                ) : null}
                {headLine ? (
                  <Polyline points={headLine} stroke="#10b981" strokeWidth={2} fill="none" />
                ) : null}
              </Svg>
              <Text style={styles.row}>Weight (pink) · Length (blue) · Head circumference (green)</Text>
            </>
          ) : (
            <Text style={styles.row}>Not enough growth percentile points to render a trend chart.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
