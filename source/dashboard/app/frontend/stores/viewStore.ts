import { create } from "zustand";

type AgentView = "grid" | "table";
type TaskView = "board" | "list";

interface ViewState {
  agentView: AgentView;
  taskView: TaskView;
  setAgentView: (view: AgentView) => void;
  setTaskView: (view: TaskView) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  agentView: "grid",
  taskView: "board",
  setAgentView: (view) => set({ agentView: view }),
  setTaskView: (view) => set({ taskView: view }),
}));
