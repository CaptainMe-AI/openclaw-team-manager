import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Agent, PaginatedResponse } from "@/types/api";

interface UseAgentsParams {
  status?: string;
  llm_model?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

export function useAgents(params: UseAgentsParams = {}) {
  return useQuery({
    queryKey: ["agents", params],
    queryFn: () =>
      apiFetch<PaginatedResponse<Agent>>("/api/v1/agents", params),
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ["agents", id],
    queryFn: () => apiFetch<Agent>(`/api/v1/agents/${id}`),
    enabled: !!id,
  });
}
