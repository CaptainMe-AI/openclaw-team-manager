import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { LatencyBucket } from "@/types/api";

const darkTooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    color: "var(--color-text-primary)",
  },
  labelStyle: {
    color: "var(--color-text-secondary)",
  },
};

interface LatencyChartProps {
  data: LatencyBucket[];
}

export function LatencyChart({ data }: LatencyChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="range"
          stroke="var(--color-text-secondary)"
          tick={{ fontSize: 12 }}
        />
        <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
        <Tooltip {...darkTooltipStyle} />
        <Bar
          dataKey="count"
          fill="var(--color-chart-4)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={true}
          animationDuration={300}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
