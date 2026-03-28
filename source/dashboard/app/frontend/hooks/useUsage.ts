import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { subHours, subDays } from "date-fns";
import type { UsageRecord, UsageSummary, UsageCharts } from "@/types/api";

interface UseUsageParams {
  agent_id?: string;
  from?: string;
  to?: string;
  granularity?: "hourly" | "daily";
}

interface UsageResponse {
  data: UsageRecord[];
}

export function useUsage(params: UseUsageParams = {}) {
  return useQuery({
    queryKey: ["usage", params],
    queryFn: () => apiFetch<UsageResponse>("/api/v1/usage", params),
  });
}

type UsageTimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

function getTimeRange(range: UsageTimeRange): { from: string; to: string } {
  const now = new Date();
  const rangeMap: Record<UsageTimeRange, Date> = {
    "1h": subHours(now, 1),
    "6h": subHours(now, 6),
    "24h": subHours(now, 24),
    "7d": subDays(now, 7),
    "30d": subDays(now, 30),
  };
  return {
    from: rangeMap[range].toISOString(),
    to: now.toISOString(),
  };
}

function getGranularity(range: UsageTimeRange): "hour" | "day" {
  return range === "7d" || range === "30d" ? "day" : "hour";
}

export function useUsageSummary(timeRange: UsageTimeRange) {
  const { from, to } = getTimeRange(timeRange);
  return useQuery({
    queryKey: ["usage-summary", timeRange],
    queryFn: () =>
      apiFetch<UsageSummary>("/api/v1/usage/summary", { from, to }),
  });
}

export function useUsageCharts(timeRange: UsageTimeRange) {
  const { from, to } = getTimeRange(timeRange);
  const granularity = getGranularity(timeRange);
  return useQuery({
    queryKey: ["usage-charts", timeRange],
    queryFn: () =>
      apiFetch<UsageCharts>("/api/v1/usage/charts", {
        from,
        to,
        granularity,
      }),
  });
}
