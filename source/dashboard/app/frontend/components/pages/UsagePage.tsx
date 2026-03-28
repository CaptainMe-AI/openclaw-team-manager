import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import { useUsageSummary, useUsageCharts } from "@/hooks/useUsage";
import { useFilterStore } from "@/stores/filterStore";
import { Button } from "@/components/ui";
import { UsageKpiCards } from "@/components/usage/UsageKpiCards";
import { UsageTimePeriod } from "@/components/usage/UsageTimePeriod";
import { ExportButton } from "@/components/usage/ExportButton";
import { ChartCard } from "@/components/usage/ChartCard";
import { TokenUsageChart } from "@/components/usage/TokenUsageChart";
import { CostBreakdownChart } from "@/components/usage/CostBreakdownChart";
import { ApiCallsChart } from "@/components/usage/ApiCallsChart";
import { LatencyChart } from "@/components/usage/LatencyChart";

function ChartSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-border p-6 animate-pulse">
      <div className="bg-surface-hover/50 rounded h-4 w-40" />
      <div className="bg-surface-hover/50 rounded h-[300px] w-full mt-4" />
    </div>
  );
}

export function UsagePage() {
  const { usageTimeRange } = useFilterStore();
  const summary = useUsageSummary(usageTimeRange);
  const charts = useUsageCharts(usageTimeRange);

  const isLoading = summary.isLoading || charts.isLoading;
  const isError = summary.isError || charts.isError;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Usage &amp; Cost Tracking
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Monitor API consumption, latency, and estimated costs across your
            agent fleet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UsageTimePeriod />
          <ExportButton
            summary={summary.data}
            costByAgent={charts.data?.cost_by_agent}
            timeRange={usageTimeRange}
          />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-danger opacity-50 mb-4"
            style={{ fontSize: 48 }}
          />
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Failed to load usage data
          </h2>
          <p className="text-sm text-text-secondary max-w-md text-center mb-6">
            Unable to fetch usage metrics from the server. Check that the Rails
            server is running and try again.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              summary.refetch();
              charts.refetch();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      {!isError && (
        <div className="mt-8">
          <UsageKpiCards
            data={summary.data}
            isLoading={summary.isLoading}
            timeRange={usageTimeRange}
          />
        </div>
      )}

      {/* Charts Grid */}
      {!isError && (
        <div className="mt-8">
          {charts.isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ChartSkeleton key={i} />
              ))}
            </div>
          ) : (
            charts.data && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Token Usage Over Time">
                  <TokenUsageChart
                    data={charts.data.token_usage_over_time}
                  />
                </ChartCard>
                <ChartCard title="Cost Breakdown by Agent">
                  <CostBreakdownChart data={charts.data.cost_by_agent} />
                </ChartCard>
                <ChartCard title="API Calls by Endpoint">
                  <ApiCallsChart data={charts.data.calls_by_endpoint} />
                </ChartCard>
                <ChartCard title="Latency Distribution">
                  <LatencyChart data={charts.data.latency_distribution} />
                </ChartCard>
              </div>
            )
          )}
        </div>
      )}

      {/* Empty state -- no data after loading */}
      {!isError &&
        !isLoading &&
        summary.data &&
        summary.data.total_tokens === 0 &&
        summary.data.total_api_calls === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FontAwesomeIcon
              icon={faChartPie}
              className="text-text-secondary opacity-50 mb-4"
              style={{ fontSize: 48 }}
            />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              No usage data available
            </h2>
            <p className="text-sm text-text-secondary max-w-md text-center">
              No usage records found for the selected time period. Try selecting
              a wider time range or check that agents have been active.
            </p>
          </div>
        )}
    </div>
  );
}
