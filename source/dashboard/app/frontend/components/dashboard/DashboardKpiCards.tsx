import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faSpinner,
  faShieldHalved,
  faCoins,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Card } from "@/components/ui";
import { formatCompact, formatTrend } from "@/lib/formatters";
import type { DashboardData } from "@/types/api";

interface DashboardKpiConfig {
  title: string;
  icon: IconDefinition;
  colorClass: string;
  bgClass: string;
  getValue: (d: DashboardData) => string;
  getTrend: (d: DashboardData) => number | null;
  trendInverted: boolean;
}

const kpiConfig: DashboardKpiConfig[] = [
  {
    title: "Active Agents",
    icon: faRobot,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    getValue: (d) => String(d.active_agents),
    getTrend: (d) => d.active_agents_trend,
    trendInverted: false,
  },
  {
    title: "Tasks in Progress",
    icon: faSpinner,
    colorClass: "text-info",
    bgClass: "bg-info/10",
    getValue: (d) => String(d.tasks_in_progress),
    getTrend: (d) => d.tasks_in_progress_trend,
    trendInverted: false,
  },
  {
    title: "Pending Approvals",
    icon: faShieldHalved,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    getValue: (d) => String(d.pending_approvals),
    getTrend: (d) => d.pending_approvals_trend,
    trendInverted: true,
  },
  {
    title: "Tokens Used (24h)",
    icon: faCoins,
    colorClass: "text-[var(--color-chart-3)]",
    bgClass: "bg-[var(--color-chart-3)]/10",
    getValue: (d) => formatCompact(d.tokens_used_24h),
    getTrend: (d) => d.tokens_trend,
    trendInverted: false,
  },
];

interface DashboardKpiCardsProps {
  data: DashboardData | undefined;
  isLoading: boolean;
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
    return (
      <span className="text-xs text-text-secondary font-semibold">--</span>
    );
  }

  const isPositive = value > 0;
  const isImprovement = inverted ? !isPositive : isPositive;
  const colorClass = isImprovement ? "text-success" : "text-danger";
  const icon = isPositive ? faArrowUp : faArrowDown;

  return (
    <span
      className={`text-xs font-semibold ${colorClass} flex items-center gap-1`}
    >
      <FontAwesomeIcon icon={icon} className="text-[10px]" />
      {formatted}
    </span>
  );
}

export function DashboardKpiCards({
  data,
  isLoading,
}: DashboardKpiCardsProps) {
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
          <span className="font-mono text-2xl font-semibold text-text-primary">
            {kpi.getValue(data)}
          </span>
        </Card>
      ))}
    </div>
  );
}
