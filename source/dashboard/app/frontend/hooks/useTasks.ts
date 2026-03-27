import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Task, PaginatedResponse } from "@/types/api";

interface UseTasksParams {
  status?: string;
  priority?: number;
  agent_id?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

export function useTasks(params: UseTasksParams = {}) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () =>
      apiFetch<PaginatedResponse<Task>>("/api/v1/tasks", params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => apiFetch<Task>(`/api/v1/tasks/${id}`),
    enabled: !!id,
  });
}
