import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import type { Task } from "@/types/api";

interface TaskListViewProps {
  tasks: Task[];
  sort?: string;
  dir?: "asc" | "desc";
  onSortChange: (column: string) => void;
}

const statusColorMap: Record<
  Task["status"],
  "success" | "danger" | "warning" | "info" | "idle"
> = {
  backlog: "idle",
  queued: "info",
  in_progress: "warning",
  awaiting_approval: "warning",
  completed: "success",
  failed: "danger",
};

const statusLabel: Record<Task["status"], string> = {
  backlog: "Backlog",
  queued: "Queued",
  in_progress: "In Progress",
  awaiting_approval: "Awaiting Approval",
  completed: "Completed",
  failed: "Failed",
};

const priorityLabel: Record<number, string> = {
  0: "P0",
  1: "P1",
  2: "P2",
  3: "P3",
};

const priorityBadgeMap: Record<number, "p0" | "p1" | "p2" | "p3"> = {
  0: "p0",
  1: "p1",
  2: "p2",
  3: "p3",
};

interface Column {
  key: string;
  label: string;
  sortable: boolean;
  width: string;
  hiddenBelow?: "md" | "lg";
}

const columns: Column[] = [
  { key: "task_id", label: "ID", sortable: false, width: "w-24" },
  { key: "title", label: "Title", sortable: true, width: "w-auto" },
  { key: "status", label: "Status", sortable: true, width: "w-32" },
  { key: "priority", label: "Priority", sortable: true, width: "w-24" },
  {
    key: "agent_name",
    label: "Agent",
    sortable: false,
    width: "w-32",
    hiddenBelow: "md",
  },
  {
    key: "created_at",
    label: "Created",
    sortable: true,
    width: "w-32",
    hiddenBelow: "lg",
  },
];

function getHiddenClass(hiddenBelow?: "md" | "lg"): string {
  if (hiddenBelow === "md") return "hidden md:table-cell";
  if (hiddenBelow === "lg") return "hidden lg:table-cell";
  return "";
}

export function TaskListView({
  tasks,
  sort,
  dir,
  onSortChange,
}: TaskListViewProps) {
  function getSortIcon(column: string) {
    if (sort !== column) return faSort;
    return dir === "asc" ? faSortUp : faSortDown;
  }

  return (
    <div className="bg-surface rounded-lg border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-background/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "p-4 text-xs uppercase tracking-wider font-normal text-left",
                  col.sortable
                    ? "cursor-pointer select-none"
                    : "",
                  sort === col.key
                    ? "text-text-primary"
                    : "text-text-secondary",
                  getHiddenClass(col.hiddenBelow),
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
                onClick={
                  col.sortable ? () => onSortChange(col.key) : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <FontAwesomeIcon
                      icon={getSortIcon(col.key)}
                      className={cn(
                        "text-[10px]",
                        sort === col.key
                          ? "text-accent"
                          : "text-text-secondary opacity-50",
                      )}
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="hover:bg-surface-hover/30 transition-colors border-t border-border"
            >
              {/* ID */}
              <td className="p-4">
                <span className="font-mono text-xs text-text-secondary">
                  {task.task_id}
                </span>
              </td>

              {/* Title */}
              <td className="p-4">
                <span className="text-text-primary font-semibold">
                  {task.title}
                </span>
              </td>

              {/* Status */}
              <td className="p-4">
                <Badge variant="status" color={statusColorMap[task.status]}>
                  {statusLabel[task.status]}
                </Badge>
              </td>

              {/* Priority */}
              <td className="p-4">
                <Badge
                  variant="priority"
                  priority={priorityBadgeMap[task.priority]}
                >
                  {priorityLabel[task.priority]}
                </Badge>
              </td>

              {/* Agent */}
              <td className={cn("p-4", getHiddenClass("md"))}>
                <span className="text-sm text-text-secondary">
                  {task.agent_name || "Unassigned"}
                </span>
              </td>

              {/* Created */}
              <td className={cn("p-4", getHiddenClass("lg"))}>
                <span className="font-mono text-xs text-text-secondary">
                  {formatDistanceToNow(new Date(task.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
