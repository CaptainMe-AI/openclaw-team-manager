import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCost } from "@/lib/formatters";
import type { CostByAgentPoint } from "@/types/api";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

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

interface CostBreakdownChartProps {
  data: CostByAgentPoint[];
}

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          isAnimationActive={true}
          animationDuration={300}
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          {...darkTooltipStyle}
          formatter={(value) => formatCost(Number(value))}
        />
        <Legend iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}
