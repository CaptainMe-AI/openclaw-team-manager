import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, Badge, Button, Sparkline } from "@/components/ui";
import type { Agent } from "@/types/api";

interface AgentCardProps {
  agent: Agent;
  onMenuOpen?: (agent: Agent) => void;
}

const statusColorMap: Record<
  Agent["status"],
  "success" | "danger" | "warning" | "idle"
> = {
  active: "success",
  idle: "idle",
  error: "danger",
  disabled: "idle",
};

function formatUptime(uptimeSince: string | null): string {
  if (!uptimeSince) return "---";
  return formatDistanceToNow(new Date(uptimeSince), { addSuffix: false });
}

function formatTokens(count: number): string {
  return count.toLocaleString();
}

export function AgentCard({ agent, onMenuOpen }: AgentCardProps) {
  return (
    <Card
      className={cn(
        agent.status === "disabled" && "opacity-50",
        agent.status === "error" && "border-danger",
      )}
    >
      {/* Header row: icon + name + menu trigger */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <FontAwesomeIcon
            icon={faRobot}
            className="text-text-secondary text-lg shrink-0"
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">
              {agent.name}
            </div>
            <div className="text-xs text-text-secondary font-mono">
              {agent.agent_id}
            </div>
          </div>
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="min-w-[44px] min-h-[44px] p-0 flex items-center justify-center"
            aria-haspopup="true"
            aria-expanded={false}
            onClick={() => onMenuOpen?.(agent)}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-text-secondary">Status:</span>
        <Badge
          variant="status"
          color={statusColorMap[agent.status]}
          dot
          pulse={agent.status === "active"}
        >
          {agent.status}
        </Badge>
      </div>

      {/* Current task */}
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs text-text-secondary shrink-0">Task:</span>
        <span className="text-xs text-text-secondary line-clamp-1">
          {agent.current_task ?? "No active task"}
        </span>
      </div>

      {/* Uptime */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-text-secondary">Uptime:</span>
        <span className="text-xs font-mono text-text-secondary">
          {formatUptime(agent.uptime_since)}
        </span>
      </div>

      {/* Tokens + sparkline */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Tokens:</span>
          <span className="text-xs font-mono text-text-secondary">
            {formatTokens(agent.tokens_7d)}
          </span>
        </div>
        <div className="w-20" aria-hidden="true">
          <Sparkline data={agent.tokens_7d_series} height={32} />
        </div>
      </div>
    </Card>
  );
}
