import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faExclamationTriangle,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import { isAfter, subDays, subHours } from "date-fns";
import { useTasks } from "@/hooks/useTasks";
import { useFilterStore } from "@/stores/filterStore";
import { useViewStore } from "@/stores/viewStore";
import { Button } from "@/components/ui";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskViewToggle } from "@/components/tasks/TaskViewToggle";
import { PriorityLegend } from "@/components/tasks/PriorityLegend";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import type { Task } from "@/types/api";

function filterByTimePeriod(tasks: Task[], period: string): Task[] {
  if (period === "all") return tasks;
  const now = new Date();
  const thresholds: Record<string, Date> = {
    "24h": subHours(now, 24),
    "7d": subDays(now, 7),
    "30d": subDays(now, 30),
  };
  const cutoff = thresholds[period];
  if (!cutoff) return tasks;
  return tasks.filter((t) => isAfter(new Date(t.created_at), cutoff));
}

function SkeletonBoard() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[280px] min-h-[200px] rounded-lg p-2 bg-background/50 animate-pulse"
        >
          <div className="bg-surface-hover/50 rounded h-4 w-24 mb-4 mx-2" />
          {Array.from({ length: 2 + (i % 2) }).map((_, j) => (
            <div
              key={j}
              className="bg-surface rounded-lg border border-border p-3 mb-2"
            >
              <div className="bg-surface-hover/50 rounded h-3 w-16 mb-2" />
              <div className="bg-surface-hover/50 rounded h-4 w-full mb-2" />
              <div className="bg-surface-hover/50 rounded h-3 w-3/4 mb-2" />
              <div className="bg-surface-hover/50 rounded h-3 w-20" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-surface rounded-lg border border-border p-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-hover/50 rounded w-full mb-3"
        />
      ))}
    </div>
  );
}

export function TasksPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState("all");
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [dir, setDir] = useState<"asc" | "desc" | undefined>(undefined);

  const { taskFilters, resetTaskFilters } = useFilterStore();
  const { taskView } = useViewStore();

  const { data, isLoading, isError, refetch } = useTasks({
    ...taskFilters,
    per_page: 100,
    sort,
    dir,
  });

  const allTasks = data?.data ?? [];
  const filteredTasks = useMemo(
    () => filterByTimePeriod(allTasks, timePeriod),
    [allTasks, timePeriod],
  );

  function handleSortChange(column: string) {
    if (sort === column) {
      if (dir === "asc") {
        setDir("desc");
      } else {
        setSort(undefined);
        setDir(undefined);
      }
    } else {
      setSort(column);
      setDir("asc");
    }
  }

  function handleClearFilters() {
    resetTaskFilters();
    setTimePeriod("all");
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Task Board
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Monitor and manage agent workflows across all stages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TaskViewToggle />
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters + Priority Legend */}
      <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
        <TaskFilters
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
        />
        <PriorityLegend />
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading &&
          (taskView === "list" ? <SkeletonTable /> : <SkeletonBoard />)}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-danger opacity-50 mb-4"
              style={{ fontSize: 48 }}
            />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Failed to load tasks
            </h2>
            <p className="text-sm text-text-secondary max-w-md text-center mb-6">
              Unable to fetch task data from the server. Check that the Rails
              server is running and try again.
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FontAwesomeIcon
              icon={faListCheck}
              className="text-text-secondary opacity-50 mb-4"
              style={{ fontSize: 48 }}
            />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {taskView === "board" ? "No tasks yet" : "No tasks found"}
            </h2>
            <p className="text-sm text-text-secondary max-w-md text-center mb-6">
              {taskView === "board"
                ? 'Create your first task to get started. Click "New Task" to assign work to an agent.'
                : "No tasks match the current filters. Try adjusting your filter criteria or create a new task."}
            </p>
            <Button variant="secondary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredTasks.length > 0 &&
          (taskView === "list" ? (
            <TaskListView
              tasks={filteredTasks}
              sort={sort}
              dir={dir}
              onSortChange={handleSortChange}
            />
          ) : (
            <KanbanBoard tasks={filteredTasks} />
          ))}
      </div>

      {/* New Task Modal */}
      <NewTaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
