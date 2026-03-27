import { AgentCard } from "./AgentCard";
import type { Agent } from "@/types/api";

interface AgentGridProps {
  agents: Agent[];
  onMenuOpen?: (agent: Agent) => void;
}

export function AgentGrid({ agents, onMenuOpen }: AgentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} onMenuOpen={onMenuOpen} />
      ))}
    </div>
  );
}
