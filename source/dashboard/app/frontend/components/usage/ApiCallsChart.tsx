import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCompact } from "@/lib/formatters";
import type { CallsByEndpointPoint } from "@/types/api";

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

interface ApiCallsChartProps {
  data: CallsByEndpointPoint[];
}

export function ApiCallsChart({ data }: ApiCallsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          type="number"
          stroke="var(--color-text-secondary)"
          tick={{ fontSize: 12 }}
          tickFormatter={formatCompact}
        />
        <YAxis
          type="category"
          dataKey="endpoint"
          stroke="var(--color-text-secondary)"
          width={180}
          tick={{ fontSize: 12 }}
        />
        <Tooltip {...darkTooltipStyle} />
        <Bar
          dataKey="calls"
          fill="var(--color-chart-2)"
          radius={[0, 4, 4, 0]}
          isAnimationActive={true}
          animationDuration={300}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
