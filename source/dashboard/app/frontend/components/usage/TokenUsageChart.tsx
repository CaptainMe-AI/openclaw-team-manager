import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { formatCompact } from "@/lib/formatters";
import type { TokenUsagePoint } from "@/types/api";

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

function pivotTokenData(data: TokenUsagePoint[]): {
  pivoted: Array<Record<string, string | number>>;
  agents: string[];
} {
  const agentSet = new Set<string>();
  const grouped = new Map<string, Record<string, string | number>>();

  for (const point of data) {
    agentSet.add(point.agent_name);
    if (!grouped.has(point.bucket)) {
      grouped.set(point.bucket, { bucket: point.bucket });
    }
    grouped.get(point.bucket)![point.agent_name] = point.total_tokens;
  }

  return {
    pivoted: Array.from(grouped.values()),
    agents: Array.from(agentSet),
  };
}

interface TokenUsageChartProps {
  data: TokenUsagePoint[];
}

export function TokenUsageChart({ data }: TokenUsageChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        No data
      </div>
    );
  }

  const { pivoted, agents } = pivotTokenData(data);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={pivoted}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="bucket"
          stroke="var(--color-text-secondary)"
          tick={{ fontSize: 12 }}
          tickFormatter={(v: string) => {
            try {
              const d = new Date(v);
              return format(
                d,
                d.getHours() === 0 && d.getMinutes() === 0
                  ? "MMM dd"
                  : "HH:mm",
              );
            } catch {
              return v;
            }
          }}
        />
        <YAxis
          stroke="var(--color-text-secondary)"
          tick={{ fontSize: 12 }}
          tickFormatter={formatCompact}
        />
        <Tooltip {...darkTooltipStyle} />
        <Legend iconType="circle" iconSize={8} />
        {agents.map((agent, i) => (
          <Area
            key={agent}
            type="monotone"
            dataKey={agent}
            stackId="tokens"
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={0.6}
            isAnimationActive={true}
            animationDuration={300}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
