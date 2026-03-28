import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { DashboardData } from "@/types/api";

export function useDashboard(timePeriod: string = "24h") {
  return useQuery({
    queryKey: ["dashboard", timePeriod],
    queryFn: () =>
      apiFetch<DashboardData>("/api/v1/dashboard", {
        time_period: timePeriod,
      }),
    staleTime: 15_000, // Dashboard refreshes more frequently (15s)
  });
}
