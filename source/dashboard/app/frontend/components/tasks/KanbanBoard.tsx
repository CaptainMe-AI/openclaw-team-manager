import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { useUpdateTaskStatus } from "@/hooks/useTasks";
import type { Task } from "@/types/api";

interface KanbanBoardProps {
  tasks: Task[];
}

const COLUMNS: Task["status"][] = [
  "backlog",
  "queued",
  "in_progress",
  "awaiting_approval",
  "completed",
  "failed",
];

const COLUMN_LABELS_LOWER: Record<Task["status"], string> = {
  backlog: "Backlog",
  queued: "Queued",
  in_progress: "In Progress",
  awaiting_approval: "Awaiting Approval",
  completed: "Completed",
  failed: "Failed",
};

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const updateStatus = useUpdateTaskStatus();

  const tasksByStatus = useMemo(() => {
    const grouped: Record<Task["status"], Task[]> = {
      backlog: [],
      queued: [],
      in_progress: [],
      awaiting_approval: [],
      completed: [],
      failed: [],
    };
    tasks.forEach((t) => {
      grouped[t.status]?.push(t);
    });
    return grouped;
  }, [tasks]);

  function findContainer(id: string): Task["status"] | undefined {
    if (COLUMNS.includes(id as Task["status"])) return id as Task["status"];
    const task = tasks.find((t) => t.id === id);
    return task?.status;
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer) return;
    if (activeContainer === overContainer) return;

    updateStatus.mutate(
      { id: active.id as string, status: overContainer },
      {
        onSuccess: () => {
          toast.success(
            `Task moved to ${COLUMN_LABELS_LOWER[overContainer]}`,
          );
        },
        onError: () => {
          toast.error("Failed to update task status");
        },
      },
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 overflow-x-auto pb-2">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
