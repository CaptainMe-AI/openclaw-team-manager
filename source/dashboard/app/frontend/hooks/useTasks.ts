import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiMutate } from "@/lib/api";
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

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      task: {
        task_id: string;
        title: string;
        description: string;
        priority: number;
        agent_id: string;
      };
    }) => apiMutate<Task>("/api/v1/tasks", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiMutate<Task>(`/api/v1/tasks/${id}`, "PATCH", {
        task: { status },
      }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousQueries = queryClient.getQueriesData<
        PaginatedResponse<Task>
      >({ queryKey: ["tasks"] });
      queryClient.setQueriesData<PaginatedResponse<Task>>(
        { queryKey: ["tasks"] },
        (old) => {
          if (!old?.data) return old as PaginatedResponse<Task>;
          return {
            ...old,
            data: old.data.map((t) =>
              t.id === id
                ? { ...t, status: status as Task["status"] }
                : t,
            ),
          };
        },
      );
      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
