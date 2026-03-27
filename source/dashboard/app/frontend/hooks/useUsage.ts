import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { UsageRecord } from "@/types/api";

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
