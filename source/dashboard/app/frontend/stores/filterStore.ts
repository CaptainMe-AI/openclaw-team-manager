import { create } from "zustand";

interface AgentFilters {
  status?: string;
  llm_model?: string;
}

interface TaskFilters {
  status?: string;
  priority?: number;
  agent_id?: string;
}

interface ApprovalFilters {
  status?: string;
  risk_level?: string;
  approval_type?: string;
}

type UsageTimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

interface FilterState {
  agentFilters: AgentFilters;
  taskFilters: TaskFilters;
  approvalFilters: ApprovalFilters;
  usageTimeRange: UsageTimeRange;
  setAgentFilters: (filters: AgentFilters) => void;
  setTaskFilters: (filters: TaskFilters) => void;
  setApprovalFilters: (filters: ApprovalFilters) => void;
  setUsageTimeRange: (range: UsageTimeRange) => void;
  resetAgentFilters: () => void;
  resetTaskFilters: () => void;
  resetApprovalFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  agentFilters: {},
  taskFilters: {},
  approvalFilters: {},
  usageTimeRange: "24h",
  setAgentFilters: (filters) =>
    set((state) => ({ agentFilters: { ...state.agentFilters, ...filters } })),
  setTaskFilters: (filters) =>
    set((state) => ({ taskFilters: { ...state.taskFilters, ...filters } })),
  setApprovalFilters: (filters) =>
    set((state) => ({
      approvalFilters: { ...state.approvalFilters, ...filters },
    })),
  setUsageTimeRange: (range) => set({ usageTimeRange: range }),
  resetAgentFilters: () => set({ agentFilters: {} }),
  resetTaskFilters: () => set({ taskFilters: {} }),
  resetApprovalFilters: () => set({ approvalFilters: {} }),
}));
