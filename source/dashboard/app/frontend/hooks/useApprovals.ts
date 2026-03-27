import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiMutate } from "@/lib/api";
import type { Approval, PaginatedResponse } from "@/types/api";

interface UseApprovalsParams {
  status?: string;
  risk_level?: string;
  approval_type?: string;
  agent_id?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

export function useApprovals(params: UseApprovalsParams = {}) {
  return useQuery({
    queryKey: ["approvals", params],
    queryFn: () =>
      apiFetch<PaginatedResponse<Approval>>("/api/v1/approvals", params),
  });
}

export function useApproval(id: string) {
  return useQuery({
    queryKey: ["approvals", id],
    queryFn: () => apiFetch<Approval>(`/api/v1/approvals/${id}`),
    enabled: !!id,
  });
}

export function useApproveApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiMutate<Approval>(`/api/v1/approvals/${id}/approve`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDenyApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiMutate<Approval>(`/api/v1/approvals/${id}/deny`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
