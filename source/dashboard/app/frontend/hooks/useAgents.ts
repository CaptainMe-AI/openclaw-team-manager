import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiMutate } from "@/lib/api";
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

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiMutate<Agent>(`/api/v1/agents/${id}`, "PATCH", { agent: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
