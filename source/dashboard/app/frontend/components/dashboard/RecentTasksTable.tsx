import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { differenceInMinutes, differenceInHours, formatDistanceToNow } from "date-fns";
import { Link } from "react-router";
import { Card, Badge } from "@/components/ui";
import type { Task } from "@/types/api";

const statusColorMap: Record<
  Task["status"],
  "success" | "danger" | "warning" | "info" | "idle"
> = {
  in_progress: "info",
  completed: "success",
  awaiting_approval: "warning",
  failed: "danger",
  queued: "idle",
  backlog: "idle",
};

const statusLabelMap: Record<Task["status"], string> = {
  in_progress: "In Progress",
  completed: "Completed",
  awaiting_approval: "Awaiting",
  failed: "Failed",
  queued: "Queued",
  backlog: "Backlog",
};

interface RecentTasksTableProps {
  tasks: Task[];
  isLoading: boolean;
}

function formatDuration(task: Task): string {
  if (task.status !== "completed" && task.status !== "failed") {
    return "--";
  }
  const created = new Date(task.created_at);
  const updated = new Date(task.updated_at);
  const totalMinutes = differenceInMinutes(updated, created);
  const hours = differenceInHours(updated, created);
  const mins = totalMinutes - hours * 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${totalMinutes}m`;
}

function SkeletonRecentTasks() {
  return (
    <Card>
      <div className="animate-pulse">
        <div className="bg-surface-hover/50 rounded h-4 w-28" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-hover/50 rounded h-10 w-full mt-2"
          />
        ))}
      </div>
    </Card>
  );
}

export function RecentTasksTable({
  tasks,
  isLoading,
}: RecentTasksTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return <SkeletonRecentTasks />;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-text-primary">
          Recent Tasks
        </h2>
        <Link to="/tasks" className="text-xs text-accent hover:underline">
          View All
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-text-secondary py-8 text-center">
          No recent tasks in this time period
        </p>
      ) : (
        <div>
          {tasks.map((task) => {
            const isExpanded = expandedId === task.id;
            return (
              <div key={task.id}>
                <div
                  className="flex items-center cursor-pointer hover:bg-surface-hover transition-colors py-3 border-b border-border last:border-b-0"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : task.id)
                  }
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedId(isExpanded ? null : task.id);
                    }
                  }}
                >
                  <span className="text-sm font-semibold text-text-primary truncate flex-1 min-w-0">
                    {task.title}
                  </span>
                  <span className="text-xs text-text-secondary w-28 flex items-center gap-1 shrink-0">
                    <FontAwesomeIcon
                      icon={faRobot}
                      className="text-[10px]"
                    />
                    <span className="truncate">
                      {task.agent_name ?? "Unassigned"}
                    </span>
                  </span>
                  <span className="w-28 shrink-0">
                    <Badge
                      variant="status"
                      color={statusColorMap[task.status]}
                    >
                      {statusLabelMap[task.status]}
                    </Badge>
                  </span>
                  <span className="text-xs font-mono text-text-secondary w-20 shrink-0">
                    {formatDuration(task)}
                  </span>
                  <span className="text-xs font-mono text-text-secondary w-24 shrink-0">
                    {formatDistanceToNow(new Date(task.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="text-xs text-text-secondary w-6 text-center shrink-0">
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronDown : faChevronRight}
                    />
                  </span>
                </div>
                {isExpanded && task.description && (
                  <div className="mt-2 pb-2 pl-4 text-xs text-text-secondary">
                    {task.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
