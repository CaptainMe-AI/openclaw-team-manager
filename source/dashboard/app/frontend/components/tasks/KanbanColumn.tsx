import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { SortableTaskCard } from "./SortableTaskCard";
import type { Task } from "@/types/api";

const COLUMN_LABELS: Record<Task["status"], string> = {
  backlog: "BACKLOG",
  queued: "QUEUED",
  in_progress: "IN PROGRESS",
  awaiting_approval: "AWAITING APPROVAL",
  completed: "COMPLETED",
  failed: "FAILED",
};

interface KanbanColumnProps {
  status: Task["status"];
  tasks: Task[];
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-[280px] min-h-[200px] rounded-lg p-2",
        "bg-background/50",
        isOver && "ring-2 ring-accent/30",
      )}
      aria-label={`${COLUMN_LABELS[status]} column, ${tasks.length} tasks`}
    >
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {COLUMN_LABELS[status]}
        </span>
        <span className="text-xs text-text-secondary">{tasks.length}</span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))
          ) : (
            <p className="text-xs text-text-secondary text-center py-8">
              No tasks
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
