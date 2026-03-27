import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useUpdateAgent } from "@/hooks/useAgents";
import type { Agent } from "@/types/api";

interface AgentContextMenuProps {
  agent: Agent;
  onClose: () => void;
}

export function AgentContextMenu({ agent, onClose }: AgentContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const updateAgent = useUpdateAgent();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  function handleRestart() {
    toast.success(`Restart signal sent to ${agent.name}`);
    onClose();
  }

  function handleViewLogs() {
    toast.info("Log viewer coming soon");
    onClose();
  }

  function handleDisable() {
    updateAgent.mutate(
      { id: agent.id, data: { status: "disabled" } },
      {
        onSuccess: () => {
          toast.success(`${agent.name} has been disabled`);
        },
        onError: () => {
          toast.error(`Failed to disable ${agent.name}. Please try again.`);
        },
      },
    );
    onClose();
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-md shadow-lg z-50"
    >
      <button
        role="menuitem"
        className="w-full px-3 py-2 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
        onClick={handleRestart}
      >
        Restart Agent
      </button>
      <button
        role="menuitem"
        className="w-full px-3 py-2 text-sm text-left text-text-primary hover:bg-surface-hover transition-colors"
        onClick={handleViewLogs}
      >
        View Logs
      </button>
      <div className="border-t border-border my-1" />
      <button
        role="menuitem"
        className="w-full px-3 py-2 text-sm text-left text-danger hover:bg-danger/10 transition-colors"
        onClick={handleDisable}
      >
        Disable Agent
      </button>
    </div>
  );
}
