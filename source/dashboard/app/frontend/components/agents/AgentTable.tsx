import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import { AgentContextMenu } from "./AgentContextMenu";
import type { Agent } from "@/types/api";

interface AgentTableProps {
  agents: Agent[];
  sort: string | undefined;
  dir: "asc" | "desc" | undefined;
  onSortChange: (column: string) => void;
}

const statusColorMap: Record<Agent["status"], "success" | "danger" | "warning" | "idle"> = {
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

interface SortableColumn {
  key: string;
  label: string;
  align: "left" | "right";
  sortable: boolean;
  hiddenBelow?: "md";
}

const columns: SortableColumn[] = [
  { key: "name", label: "Name", align: "left", sortable: true },
  { key: "status", label: "Status", align: "left", sortable: true },
  { key: "llm_model", label: "Model", align: "left", sortable: true },
  { key: "current_task", label: "Current Task", align: "left", sortable: false, hiddenBelow: "md" },
  { key: "uptime_since", label: "Uptime", align: "right", sortable: true },
  { key: "tokens_7d", label: "Tokens (7d)", align: "right", sortable: true },
  { key: "actions", label: "", align: "right", sortable: false },
];

export function AgentTable({ agents, sort, dir, onSortChange }: AgentTableProps) {
  const [menuAgent, setMenuAgent] = useState<Agent | null>(null);

  function getSortIcon(columnKey: string) {
    if (sort !== columnKey) return faSort;
    return dir === "asc" ? faSortUp : faSortDown;
  }

  function renderCell(agent: Agent, column: SortableColumn) {
    switch (column.key) {
      case "name":
        return (
          <div>
            <div className="text-sm font-semibold text-text-primary">{agent.name}</div>
            <div className="text-xs text-text-secondary font-mono">{agent.agent_id}</div>
          </div>
        );
      case "status":
        return (
          <Badge
            variant="status"
            color={statusColorMap[agent.status]}
            dot
            pulse={agent.status === "active"}
          >
            {agent.status}
          </Badge>
        );
      case "llm_model":
        return (
          <span className="text-sm text-text-primary">{agent.llm_model ?? "---"}</span>
        );
      case "current_task":
        return (
          <span className="text-sm text-text-secondary line-clamp-1">
            {agent.current_task ?? "---"}
          </span>
        );
      case "uptime_since":
        return (
          <span className="text-xs font-mono text-text-secondary">
            {formatUptime(agent.uptime_since)}
          </span>
        );
      case "tokens_7d":
        return (
          <span className="text-xs font-mono text-text-secondary">
            {formatTokens(agent.tokens_7d)}
          </span>
        );
      case "actions":
        return (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              aria-haspopup="true"
              aria-expanded={menuAgent?.id === agent.id}
              onClick={(e) => {
                e.stopPropagation();
                setMenuAgent(menuAgent?.id === agent.id ? null : agent);
              }}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </Button>
            {menuAgent?.id === agent.id && (
              <AgentContextMenu agent={agent} onClose={() => setMenuAgent(null)} />
            )}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="overflow-x-auto bg-surface rounded-lg border border-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-hover/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "p-4 text-xs uppercase tracking-wider font-normal",
                  col.align === "right" ? "text-right" : "text-left",
                  col.sortable ? "cursor-pointer select-none" : "",
                  sort === col.key ? "text-text-primary" : "text-text-secondary",
                  col.hiddenBelow === "md" && "hidden md:table-cell",
                )}
                aria-sort={
                  col.sortable
                    ? sort === col.key
                      ? dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
                onClick={col.sortable ? () => onSortChange(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <FontAwesomeIcon
                      icon={getSortIcon(col.key)}
                      className={cn(
                        "text-[10px]",
                        sort === col.key ? "text-accent" : "text-text-secondary opacity-50",
                      )}
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-border">
          {agents.map((agent) => (
            <tr
              key={agent.id}
              className={cn(
                "hover:bg-surface-hover/30 transition-colors",
                agent.status === "disabled" && "opacity-50",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "p-4",
                    col.align === "right" ? "text-right" : "text-left",
                    col.hiddenBelow === "md" && "hidden md:table-cell",
                  )}
                >
                  {renderCell(agent, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
