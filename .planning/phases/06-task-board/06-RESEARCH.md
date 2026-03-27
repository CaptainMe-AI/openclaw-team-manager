# Phase 6: Task Board - Research

**Researched:** 2026-03-27
**Domain:** React Kanban board with drag-and-drop (dnd-kit), form modals, view toggling, API mutations
**Confidence:** HIGH

## Summary

Phase 6 builds the Task Board page -- the most interaction-heavy screen in the dashboard so far. It consists of three major subsystems: (1) a Kanban board with 6 columns and drag-and-drop card movement using `@dnd-kit/core` + `@dnd-kit/sortable`, (2) a list view alternative with sortable columns, and (3) a "Create New Task" modal with form validation. All data flows through the existing `Task` model/API and `useTasks` hook from Phase 4.

The backend API (`/api/v1/tasks`) already supports index (with filters + pagination), show, create, and update. The `Task` model has the correct enum statuses (backlog, queued, in_progress, awaiting_approval, completed, failed) and integer priority (0-3). The `useTasks` hook, `filterStore` (with `taskFilters`), and `viewStore` (with `taskView: "board" | "list"`) are already scaffolded from Phase 4. This phase is purely frontend-focused -- no new models, migrations, or API endpoints are needed.

The key technical challenge is the Kanban drag-and-drop implementation. dnd-kit's multi-container sortable pattern requires: a `DndContext` wrapping the entire board, one `SortableContext` per column, sensors for pointer and keyboard input, `closestCorners` collision detection (better than default for multi-container), and coordinated `onDragStart`/`onDragOver`/`onDragEnd` handlers. A `DragOverlay` renders the card being dragged. When a card moves between columns, the frontend calls `PATCH /api/v1/tasks/:id` with the new status to persist the change.

**Primary recommendation:** Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`. Build the Kanban board as the primary view, the list view as a table reusing the `AgentTable` pattern, and the modal as a controlled form with `useMutation`. Fetch all tasks (per_page=100) for the board view to avoid paginating across columns.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TASK-01 | Kanban columns -- Backlog, Queued, In Progress, Awaiting Approval, Completed, Failed | Task model already has matching enum statuses. SortableContext per column. |
| TASK-02 | Task cards -- left border priority color, task ID, priority badge, title, description (2-line clamp), agent, timestamp | Badge component supports priority variant. CSS theme has priority-0 through priority-3 colors. |
| TASK-03 | Drag-and-drop cards between columns using dnd-kit | @dnd-kit/core 6.3.1 + @dnd-kit/sortable 10.0.0 multi-container pattern. PATCH API to persist status change. |
| TASK-04 | Priority system -- P0 (red), P1 (amber), P2 (blue), P3 (gray) | Already defined in CSS theme tokens (priority-0 through priority-3) and Badge component. |
| TASK-05 | Board/List view toggle | viewStore already has `taskView: "board" | "list"` and `setTaskView`. Replicate AgentViewToggle pattern. |
| TASK-06 | Filters bar -- agent, priority, time period | filterStore already has `taskFilters: { status?, priority?, agent_id? }`. Add time period filter client-side. |
| TASK-07 | Priority legend display | Static UI component showing P0-P3 color dots with labels. |
| NTSK-01 | Modal dialog with fields: task name, agent dropdown, description textarea, priority button group | Build modal using existing Input/Button components. Dropdown needs a new Select component or native <select>. |
| NTSK-02 | Attachment/file upload area with drag-and-drop | Visual placeholder for file upload area (no backend file processing in v1 -- mock data layer). |
| NTSK-03 | Form validation -- required fields (name, agent, description, priority), cancel/create actions | Client-side validation with error states using existing Input error prop. useMutation for create. |
| NTSK-04 | Default priority set to Medium | Form state initializes priority to 2 (P2/Medium). |
</phase_requirements>

## Standard Stack

### Core (Must Install)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | 6.3.1 | DnD context, sensors, collision detection | Locked decision per CLAUDE.md. The standard React DnD library. |
| @dnd-kit/sortable | 10.0.0 | Sortable preset for Kanban columns | Works with @dnd-kit/core for multi-container sortable. |
| @dnd-kit/utilities | 3.2.2 | CSS transform utilities for drag animations | Provides CSS.Transform.toString() for smooth drag visual. |

### Already Installed (No Action Needed)
| Library | Version | Purpose | Already Used By |
|---------|---------|---------|-----------------|
| @tanstack/react-query | ^5.95.2 | Server state, mutations, cache invalidation | Phase 4 hooks |
| zustand | ^5.0.12 | UI state (view toggle, filters) | filterStore, viewStore |
| date-fns | ^4.1.0 | Relative timestamps | AgentCard |
| sonner | ^2.0.7 | Toast notifications | App.tsx (Toaster configured) |
| @fortawesome/react-fontawesome | ^3.3.0 | Icons | Throughout |
| clsx + tailwind-merge | installed | cn() utility | utils.ts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/core + sortable | @dnd-kit/react v0.3.2 | Unified API but pre-1.0 (38 npm dependents). Too immature. |
| Native <select> for agent dropdown | Headless UI Listbox | Adds a dependency. Native <select> styled with Tailwind is sufficient for v1. |
| Custom file upload component | react-dropzone | Adds a dependency. The attachment area is a visual placeholder in v1 (no backend file storage). |

**Installation:**
```bash
cd source/dashboard && yarn add @dnd-kit/core@6.3.1 @dnd-kit/sortable@10.0.0 @dnd-kit/utilities@3.2.2
```

## Architecture Patterns

### Recommended Component Structure
```
app/frontend/
  components/
    tasks/
      KanbanBoard.tsx          # DndContext + columns + DragOverlay
      KanbanColumn.tsx         # Single column with SortableContext
      TaskCard.tsx             # Draggable task card (used in both views)
      TaskListView.tsx         # Table view (replicates AgentTable pattern)
      TaskFilters.tsx          # Agent/Priority/Time filter bar
      TaskViewToggle.tsx       # Board/List toggle (replicates AgentViewToggle)
      PriorityLegend.tsx       # P0-P3 color legend
      NewTaskModal.tsx         # Create task modal with form
    pages/
      TasksPage.tsx            # Orchestrator page (replace placeholder)
  hooks/
    useTasks.ts                # Already exists - ADD useCreateTask, useUpdateTask mutations
```

### Pattern 1: Multi-Container Kanban with dnd-kit

**What:** DndContext wraps the entire board. Each column is a droppable container with its own SortableContext. Cards use useSortable.

**When to use:** Whenever items need to move between distinct groups/containers.

**Key implementation details:**

```typescript
// KanbanBoard.tsx - Core structure
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

const COLUMNS: Task["status"][] = [
  "backlog", "queued", "in_progress",
  "awaiting_approval", "completed", "failed",
];

// Sensors with activation constraint to distinguish click from drag
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);

// State: track activeId for DragOverlay, group tasks by status
const [activeTask, setActiveTask] = useState<Task | null>(null);

// DndContext with closestCorners (better for multi-container than closestCenter)
<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  {COLUMNS.map((status) => (
    <KanbanColumn key={status} status={status} tasks={tasksByStatus[status]} />
  ))}
  <DragOverlay>
    {activeTask ? <TaskCard task={activeTask} isDragOverlay /> : null}
  </DragOverlay>
</DndContext>
```

### Pattern 2: Optimistic Task Status Update

**What:** When a card is dropped in a new column, update the UI immediately (optimistic) then PATCH the API. Roll back on error.

**When to use:** Drag-and-drop status changes.

```typescript
// In useTasks.ts - add mutation
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiMutate<Task>(`/api/v1/tasks/${id}`, "PATCH", { task: { status } }),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      // Snapshot previous value
      const previous = queryClient.getQueryData(["tasks"]);
      // Optimistically update cache
      queryClient.setQueriesData({ queryKey: ["tasks"] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((t: Task) =>
            t.id === id ? { ...t, status } : t
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Roll back
      if (context?.previous) {
        queryClient.setQueriesData({ queryKey: ["tasks"] }, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
```

### Pattern 3: Task Card with Priority Border

**What:** Each task card has a colored left border indicating priority.

**When to use:** All task cards in both board and list views.

```typescript
// TaskCard.tsx
const priorityBorderColors: Record<number, string> = {
  0: "border-l-priority-0",  // red
  1: "border-l-priority-1",  // amber
  2: "border-l-priority-2",  // blue
  3: "border-l-priority-3",  // gray
};

const priorityLabels: Record<number, string> = {
  0: "P0", 1: "P1", 2: "P2", 3: "P3",
};

<div className={cn(
  "bg-surface rounded-lg border border-border border-l-4",
  priorityBorderColors[task.priority],
  isDragOverlay && "shadow-lg rotate-[2deg]",
)}>
  {/* Task ID + Priority badge */}
  <div className="flex items-center justify-between">
    <span className="text-xs font-mono text-text-secondary">{task.task_id}</span>
    <Badge variant="priority" priority={`p${task.priority}` as PriorityLevel}>
      {priorityLabels[task.priority]}
    </Badge>
  </div>
  {/* Title */}
  <h4 className="text-sm font-semibold text-text-primary mt-1">{task.title}</h4>
  {/* Description (2-line clamp) */}
  <p className="text-xs text-text-secondary line-clamp-2 mt-1">{task.description}</p>
  {/* Agent + timestamp footer */}
</div>
```

### Pattern 4: New Task Modal Form

**What:** Controlled form in a modal overlay with validation. Uses existing UI components.

**When to use:** "New Task" button click.

```typescript
// NewTaskModal.tsx
interface NewTaskForm {
  title: string;
  agent_id: string;
  description: string;
  priority: number;
}

// Default priority = 2 (Medium) per NTSK-04
const [form, setForm] = useState<NewTaskForm>({
  title: "", agent_id: "", description: "", priority: 2,
});

// Validation: all fields required except attachments
const errors = {
  title: !form.title.trim() ? "Task name is required" : undefined,
  agent_id: !form.agent_id ? "Agent selection is required" : undefined,
  description: !form.description.trim() ? "Description is required" : undefined,
};

// Submit via useMutation
const createTask = useCreateTask();
function handleSubmit() {
  if (Object.values(errors).some(Boolean)) return;
  createTask.mutate({
    task: {
      task_id: `TASK-${Date.now()}`,  // Client-generated ID
      ...form,
    }
  }, {
    onSuccess: () => { onClose(); toast.success("Task created"); },
    onError: () => { toast.error("Failed to create task"); },
  });
}
```

### Pattern 5: Board-View Data Fetching Strategy

**What:** Fetch ALL tasks for the board view (per_page=100), then group client-side by status.

**When to use:** Board view needs all tasks across all columns simultaneously.

```typescript
// In TasksPage.tsx
const { data, isLoading } = useTasks({
  ...taskFilters,
  per_page: 100,  // Get all tasks for board view (max_limit=100 in pagy config)
});

// Group tasks by status for Kanban columns
const tasksByStatus = useMemo(() => {
  const tasks = data?.data ?? [];
  const grouped: Record<string, Task[]> = {
    backlog: [], queued: [], in_progress: [],
    awaiting_approval: [], completed: [], failed: [],
  };
  tasks.forEach((t) => { grouped[t.status]?.push(t); });
  return grouped;
}, [data]);
```

### Anti-Patterns to Avoid

- **Paginating per column:** Do NOT make 6 separate API calls (one per status) or paginate within columns. Fetch all tasks in one request and group client-side. The seed data has ~35 tasks; even 100 is fine.
- **Storing drag state in Zustand:** Drag state is ephemeral and belongs in local component state (useState). Only persist to Zustand/server what needs to survive beyond the drag gesture.
- **Using onDragEnd alone:** For multi-container, you MUST use `onDragOver` to handle cross-container movement during the drag (not just at the end). `onDragEnd` only finalizes the operation.
- **Missing DragOverlay:** Without DragOverlay, the original card disappears during drag. Always render a DragOverlay to show a visual clone of the dragged card.
- **Forgetting activation constraint on PointerSensor:** Without `{ distance: 8 }`, every click on a card triggers a drag. This breaks card click interactions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop between containers | Custom mouse event handlers | @dnd-kit/core + @dnd-kit/sortable | Keyboard accessibility, touch support, collision detection, animations -- hundreds of edge cases |
| Optimistic cache updates | Manual React state for task positions | TanStack Query onMutate/onError | Race conditions, stale data, rollback logic |
| Form validation | Custom validation logic from scratch | Controlled state + inline error checks | The form only has 4 fields. A form library (react-hook-form) would be overkill. |
| Toast notifications | Custom notification system | sonner (already configured) | Toaster already in App.tsx with dark theme styling |
| CSS class composition | String concatenation | cn() from utils.ts | Already established pattern, handles Tailwind conflicts |

**Key insight:** The Kanban board is deceptively complex. dnd-kit handles sensors, collision detection, keyboard navigation, scroll containers, drag overlays, and accessibility announcements. Building this from raw mouse/touch events would take 10x longer and miss accessibility entirely.

## Common Pitfalls

### Pitfall 1: Collision Detection Choice
**What goes wrong:** Default `rectIntersection` collision detection fails with tall columns and small cards -- the drag target "jumps" between containers unpredictably.
**Why it happens:** `rectIntersection` uses bounding rectangle overlap which is ambiguous when columns are side-by-side.
**How to avoid:** Use `closestCorners` collision detection strategy. It measures distance to the four corners of droppable areas and picks the nearest one, which works reliably for vertical lists in horizontal columns.
**Warning signs:** Cards "teleporting" between non-adjacent columns during drag.

### Pitfall 2: Missing Container Droppable for Empty Columns
**What goes wrong:** Cannot drop a card into an empty column.
**Why it happens:** If a column has no sortable items, there's no droppable target registered. SortableContext only creates droppable zones around its items.
**How to avoid:** Make each KanbanColumn itself a `useDroppable` target with `id={status}`. This ensures empty columns remain valid drop targets. The column must have a minimum height.
**Warning signs:** Cards can only be dropped into columns that already contain cards.

### Pitfall 3: Stale activeTask During Drag
**What goes wrong:** DragOverlay renders stale task data or disappears.
**Why it happens:** If the tasks data refetches during a drag operation, the activeTask reference becomes stale.
**How to avoid:** Store the full task object in state on `onDragStart`, not just the ID. Don't refetch during active drag (TanStack Query's refetchOnWindowFocus won't trigger during drag, but be careful with interval refetch).
**Warning signs:** DragOverlay flickers or shows wrong data mid-drag.

### Pitfall 4: Task ID Generation for New Tasks
**What goes wrong:** Duplicate task_id values cause unique constraint violations.
**Why it happens:** The `task_id` field has a unique index. If the client generates IDs like "TASK-001", they'll collide with seed data.
**How to avoid:** Generate task_id on the server side in the service layer, or use a timestamp/random suffix pattern client-side (e.g., `TASK-${Date.now().toString(36).toUpperCase()}`). Alternatively, let the backend auto-generate the task_id in TaskService.create.
**Warning signs:** 422 errors when creating tasks.

### Pitfall 5: Priority Mapping Between Design and Model
**What goes wrong:** The design spec says P0=Critical/High, P1=High/Medium-High, etc. but the model uses integers 0-3. The form shows "Low/Medium/High" labels.
**Why it happens:** Multiple naming conventions for the same data.
**How to avoid:** Establish a clear mapping: P0 (0) = Critical (red), P1 (1) = High (amber), P2 (2) = Medium (blue), P3 (3) = Low (gray). The form button group shows: Critical / High / Medium (default) / Low. Store as integer in the model.
**Warning signs:** Inconsistent priority labels across board cards, filter dropdowns, and creation form.

### Pitfall 6: Horizontal Scroll on the Kanban Board
**What goes wrong:** 6 columns overflow the viewport on smaller screens, content is cut off.
**Why it happens:** 6 columns at minimum width (~220px each) = ~1320px minimum. Tablets and small desktops can't fit them all.
**How to avoid:** Wrap the column container in `overflow-x-auto` with `flex` and `min-w-[220px]` per column. Test at 1024px breakpoint.
**Warning signs:** Columns stacking vertically or disappearing off-screen without scroll.

## Code Examples

### Sortable Task Card with useSortable
```typescript
// Source: dnd-kit official docs (dndkit.com/presets/sortable)
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTaskCardProps {
  task: Task;
}

export function SortableTaskCard({ task }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}
```

### Kanban Column with Droppable + SortableContext
```typescript
// Source: dnd-kit docs multi-container pattern
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface KanbanColumnProps {
  status: Task["status"];
  tasks: Task[];
}

const COLUMN_LABELS: Record<Task["status"], string> = {
  backlog: "BACKLOG",
  queued: "QUEUED",
  in_progress: "IN PROGRESS",
  awaiting_approval: "AWAITING APPROVAL",
  completed: "COMPLETED",
  failed: "FAILED",
};

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
    >
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {COLUMN_LABELS[status]}
        </span>
        <span className="text-xs text-text-secondary">{tasks.length}</span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
```

### Modal Pattern (Backdrop + Centered Content)
```typescript
// Follows project's existing dark theme styling
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* Content */}
      <div
        className="relative bg-surface border border-border rounded-lg shadow-xl w-full max-w-lg mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            className="text-text-secondary hover:text-text-primary"
            onClick={onClose}
            aria-label="Close"
          >
            {/* X icon */}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

### Agent Dropdown (Styled Native Select)
```typescript
// Fetch agents for the dropdown
const { data: agentsData } = useAgents({ per_page: 100 });
const agents = agentsData?.data ?? [];

<div className="w-full">
  <label className="block text-sm font-semibold text-text-primary mb-1">
    Assign Agent *
  </label>
  <select
    className={cn(
      "w-full bg-background border border-border rounded-md py-2 px-3",
      "text-sm text-text-primary",
      "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent",
      errors.agent_id && "border-danger",
    )}
    value={form.agent_id}
    onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
  >
    <option value="">Select an agent...</option>
    {agents.map((agent) => (
      <option key={agent.id} value={agent.id}>{agent.name}</option>
    ))}
  </select>
  {errors.agent_id && (
    <p className="mt-1 text-xs text-danger">{errors.agent_id}</p>
  )}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit/core + @dnd-kit/sortable | 2022 (rbd deprecated) | dnd-kit is the standard for React DnD since rbd deprecation |
| @dnd-kit/react (unified) | @dnd-kit/core + @dnd-kit/sortable (separate) | 2025 (v0.x released) | @dnd-kit/react unifies the API but is pre-1.0. Stick with core+sortable for production. |
| Form libraries (react-hook-form) for all forms | Controlled state for simple forms | Ongoing | For a 4-field form, controlled state with useState is simpler and has zero deps |

**Deprecated/outdated:**
- react-beautiful-dnd: Deprecated by Atlassian 2022, incompatible with React 18+ strict mode
- @dnd-kit/react v0.x: Pre-1.0, only 38 npm dependents. Do not use in production yet.

## Open Questions

1. **Task ID generation strategy**
   - What we know: task_id is a unique string field (e.g., "TASK-001"). Seed data uses sequential numbering.
   - What's unclear: Should the client generate the ID, or should the backend auto-assign it?
   - Recommendation: Generate on the client side using a pattern like `TASK-${Date.now().toString(36).toUpperCase()}` to avoid collisions. Alternatively, update TaskService.create to auto-generate if task_id is blank. Server-side is more reliable.

2. **Attachment area behavior in v1**
   - What we know: NTSK-02 requires an attachment/file upload area. No backend file storage exists in v1 (mock data layer).
   - What's unclear: Should the attachment area be functional (upload to nowhere) or a visual placeholder?
   - Recommendation: Build the visual area (dashed border, drag zone appearance) but make it a non-functional placeholder. Show a toast ("File attachments coming soon") or simply render the area without wiring upload logic.

3. **Time period filter semantics for tasks**
   - What we know: TASK-06 requires a "time period" filter. Tasks have created_at and updated_at.
   - What's unclear: Whether filtering should be server-side (add time params to API) or client-side.
   - Recommendation: Client-side filter on `created_at` for simplicity. Options: Last 24h, Last 7d, Last 30d, All time. Filter after fetching all tasks.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.4 + Playwright 1.58.2 |
| Config file | `spec/rails_helper.rb` (RSpec), `e2e/playwright.config.js` (E2E) |
| Quick run command | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/tasks_spec.rb` |
| Full suite command | `cd source/dashboard && bundle exec rspec` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TASK-01 | 6 Kanban columns render with correct tasks | E2E | Playwright test | No -- Wave 0 |
| TASK-02 | Task cards show priority border, ID, badge, title, desc, agent, time | E2E | Playwright test | No -- Wave 0 |
| TASK-03 | Drag card between columns updates task status | E2E | Playwright test | No -- Wave 0 |
| TASK-04 | Priority colors P0-P3 render correctly | Unit (component) | Not applicable (visual) | No |
| TASK-05 | Board/List view toggle switches views | E2E | Playwright test | No -- Wave 0 |
| TASK-06 | Filters (agent, priority, time) narrow visible tasks | E2E | Playwright test | No -- Wave 0 |
| TASK-07 | Priority legend displays P0-P3 with colors | Unit (visual) | Not applicable (visual) | No |
| NTSK-01 | New Task modal opens with all fields | E2E | Playwright test | No -- Wave 0 |
| NTSK-02 | Attachment area renders in modal | E2E | Playwright test | No -- Wave 0 |
| NTSK-03 | Form validation shows errors for empty required fields, create succeeds | E2E + Request spec | `bundle exec rspec spec/requests/api/v1/tasks_spec.rb` | Partial (create not tested) |
| NTSK-04 | Default priority is Medium (2) | E2E | Playwright test | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd source/dashboard && bundle exec rspec spec/requests/api/v1/tasks_spec.rb -f progress`
- **Per wave merge:** `cd source/dashboard && bundle exec rspec`
- **Phase gate:** Full RSpec suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `spec/requests/api/v1/tasks_spec.rb` -- ADD create/update specs (currently only index/show tested)
- [ ] E2E test for Task Board page is not required for Wave 0 (visual/interaction tests deferred to post-phase verification)

## Sources

### Primary (HIGH confidence)
- dnd-kit official documentation (dndkit.com/presets/sortable) -- SortableContext, useSortable, strategies, multi-container pattern
- dnd-kit official documentation (dndkit.com/presets/sortable/sortable-context) -- SortableContext API, items format, strategy options
- npm registry -- @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0, @dnd-kit/utilities 3.2.2 (verified 2026-03-27)
- Existing codebase: Task model (task.rb), TaskService, tasks_controller.rb, useTasks.ts, filterStore.ts, viewStore.ts
- Design spec: TEAM_MANAGER_SPEC.md sections 3 (Task Board) and 4 (Create New Task)
- Design screenshots: screenshot_5.png (Task Board), screenshot_6.png (New Task Modal)

### Secondary (MEDIUM confidence)
- [LogRocket: Build a Kanban board with dnd-kit and React](https://blog.logrocket.com/build-kanban-board-dnd-kit-react/) -- Implementation patterns
- [DeepWiki: dnd-kit Multiple Containers](https://deepwiki.com/clauderic/dnd-kit/4.4-multiple-containers) -- Multi-container architecture
- [Radzion: Building a Drag-and-Drop Kanban Board with React and dnd-kit](https://radzion.com/blog/kanban/) -- onDragOver/onDragEnd patterns, DragOverlay usage
- [GitHub: react-dnd-kit-tailwind-shadcn-ui](https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui) -- Tailwind + dnd-kit Kanban reference

### Tertiary (LOW confidence)
- None -- all findings verified against official docs or codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- dnd-kit versions verified via npm, all other libraries already installed and in use
- Architecture: HIGH -- patterns derived from official dnd-kit docs and existing codebase conventions (AgentsPage, filterStore, viewStore all scaffolded)
- Pitfalls: HIGH -- multi-container dnd-kit is well-documented with known gotchas (empty columns, collision detection, activation constraints)

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable libraries, no breaking changes expected)
