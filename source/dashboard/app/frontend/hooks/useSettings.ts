import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiMutate } from "@/lib/api";
import type { Setting } from "@/types/api";

interface SettingsResponse {
  data: Setting[];
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiFetch<SettingsResponse>("/api/v1/settings"),
  });
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: ["settings", key],
    queryFn: () => apiFetch<Setting>(`/api/v1/settings/${key}`),
    enabled: !!key,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      apiMutate<Setting>(`/api/v1/settings/${key}`, "PATCH", {
        setting: { value },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
