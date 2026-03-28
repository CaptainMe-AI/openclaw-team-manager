import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faNetworkWired,
  faDollarSign,
  faStopwatch,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Card } from "@/components/ui";
import {
  formatCompact,
  formatCost,
  formatLatency,
  formatTrend,
} from "@/lib/formatters";
import type { UsageSummary } from "@/types/api";

interface KpiConfig {
  title: string;
  icon: IconDefinition;
  colorClass: string;
  bgClass: string;
  getValue: (d: UsageSummary) => string;
  getTrend: (d: UsageSummary) => number | null;
  trendInverted: boolean;
}

const kpiConfig: KpiConfig[] = [
  {
    title: "Total Tokens",
    icon: faCoins,
    colorClass: "text-[var(--color-chart-1)]",
    bgClass: "bg-[var(--color-chart-1)]/10",
    getValue: (d) => formatCompact(d.total_tokens),
    getTrend: (d) => d.token_trend,
    trendInverted: false,
  },
  {
    title: "Total API Calls",
    icon: faNetworkWired,
    colorClass: "text-[var(--color-chart-2)]",
    bgClass: "bg-[var(--color-chart-2)]/10",
    getValue: (d) => formatCompact(d.total_api_calls),
    getTrend: (d) => d.api_calls_trend,
    trendInverted: false,
  },
  {
    title: "Estimated Cost",
    icon: faDollarSign,
    colorClass: "text-[var(--color-chart-5)]",
    bgClass: "bg-[var(--color-chart-5)]/10",
    getValue: (d) => formatCost(d.total_cost_cents),
    getTrend: (d) => d.cost_trend,
    trendInverted: true,
  },
  {
    title: "Avg Latency",
    icon: faStopwatch,
    colorClass: "text-[var(--color-chart-3)]",
    bgClass: "bg-[var(--color-chart-3)]/10",
    getValue: (d) =>
      d.avg_latency_ms !== null ? formatLatency(d.avg_latency_ms) : "--",
    getTrend: (d) => d.latency_trend,
    trendInverted: true,
  },
];

interface UsageKpiCardsProps {
  data: UsageSummary | undefined;
  isLoading: boolean;
  timeRange: string;
}

function SkeletonKpiCard() {
  return (
    <Card>
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-surface-hover/50 rounded-lg w-10 h-10" />
            <div className="bg-surface-hover/50 rounded h-3 w-20" />
          </div>
          <div className="bg-surface-hover/50 rounded h-3 w-12" />
        </div>
        <div className="bg-surface-hover/50 rounded h-7 w-24" />
      </div>
    </Card>
  );
}

function TrendBadge({
  value,
  inverted,
}: {
  value: number | null;
  inverted: boolean;
}) {
  const formatted = formatTrend(value);
  if (!formatted || value === null) {
    return <span className="text-xs text-text-secondary font-semibold">--</span>;
  }

  const isPositive = value > 0;
  const isImprovement = inverted ? !isPositive : isPositive;
  const colorClass = isImprovement ? "text-success" : "text-danger";
  const icon = isPositive ? faArrowUp : faArrowDown;

  return (
    <span className={`text-xs font-semibold ${colorClass} flex items-center gap-1`}>
      <FontAwesomeIcon icon={icon} className="text-[10px]" />
      {formatted}
    </span>
  );
}

export function UsageKpiCards({
  data,
  isLoading,
  timeRange,
}: UsageKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiConfig.map((kpi) => (
        <Card key={kpi.title}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${kpi.bgClass} flex items-center justify-center`}
              >
                <FontAwesomeIcon
                  icon={kpi.icon}
                  className={`text-base ${kpi.colorClass}`}
                />
              </div>
              <span className="text-xs text-text-secondary">{kpi.title}</span>
            </div>
            <TrendBadge
              value={kpi.getTrend(data)}
              inverted={kpi.trendInverted}
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-semibold text-text-primary">
              {kpi.getValue(data)}
            </span>
            <span className="text-xs text-text-secondary">/ {timeRange}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
