import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faUserXmark } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import type { Task } from "@/types/api";

interface TaskCardProps {
  task: Task;
  isDragOverlay?: boolean;
}

const priorityBorderColors: Record<number, string> = {
  0: "border-l-priority-0",
  1: "border-l-priority-1",
  2: "border-l-priority-2",
  3: "border-l-priority-3",
};

const priorityLabels: Record<number, string> = {
  0: "P0",
  1: "P1",
  2: "P2",
  3: "P3",
};

const priorityToBadgeProp: Record<number, "p0" | "p1" | "p2" | "p3"> = {
  0: "p0",
  1: "p1",
  2: "p2",
  3: "p3",
};

export function TaskCard({ task, isDragOverlay = false }: TaskCardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-lg border border-border border-l-4 p-3",
        priorityBorderColors[task.priority],
        "hover:border-text-secondary transition-colors",
        isDragOverlay && "shadow-lg rotate-[2deg]",
      )}
    >
      {/* Row 1: task ID + priority badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-text-secondary">
          {task.task_id}
        </span>
        <Badge
          variant="priority"
          priority={priorityToBadgeProp[task.priority]}
        >
          {priorityLabels[task.priority]}
        </Badge>
      </div>

      {/* Row 2: title */}
      <h4 className="text-sm font-semibold text-text-primary mt-1 truncate">
        {task.title}
      </h4>

      {/* Row 3: description */}
      <p className="text-xs text-text-secondary line-clamp-2 mt-1">
        {task.description || ""}
      </p>

      {/* Row 4: agent + timestamp */}
      <div className="flex items-center justify-between mt-2">
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          {task.agent_name ? (
            <>
              <FontAwesomeIcon icon={faRobot} className="text-[10px]" />
              <span className="truncate max-w-[120px]">{task.agent_name}</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faUserXmark} className="text-[10px]" />
              <span className="italic">Unassigned</span>
            </>
          )}
        </span>
        <span className="text-xs font-mono text-text-secondary">
          {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
