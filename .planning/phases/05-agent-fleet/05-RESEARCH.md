# Phase 5: Agent Fleet - Research

**Researched:** 2026-03-27
**Domain:** React dashboard page with dual-view (grid/table), filtering, context menus, sparkline charts
**Confidence:** HIGH

## Summary

Phase 5 builds the Agent Fleet page -- the first full feature screen in the application. It replaces the current `AgentsPage` placeholder with a complete agent management interface supporting grid and table views, status/model filtering, context menus with agent actions, and visual status indicators including token usage sparklines.

The foundation is solid: the Agent model, API endpoints (`/api/v1/agents`), service layer (`AgentService`), React hooks (`useAgents`), and Zustand stores (`filterStore`, `viewStore`) are all in place from Phase 4. The main work is (1) enriching the API response with computed/associated data (current task, 7-day token totals), (2) installing Recharts for sparklines, and (3) building the page-level React components that compose the existing design system primitives.

**Primary recommendation:** Build in two plans -- Plan 01 for API enrichment plus grid view with agent cards, Plan 02 for table view with sorting, context menu, and filters bar. Both plans use existing design system components (Card, Badge, StatusDot, Table, Button) and the already-wired useAgents hook + Zustand stores.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AGNT-01 | Grid view with agent cards -- icon, name, ID, status badge, current task, uptime, token usage sparkline, context menu | Existing Card, Badge, StatusDot components. Recharts LineChart for sparkline. API enrichment needed for current_task and tokens_7d. |
| AGNT-02 | Table view with sortable columns -- name, ID, status, model, task, uptime, tokens (7d) | Existing Table component with ColumnDef. useAgents hook already supports sort/dir params. Client-side sort toggles. |
| AGNT-03 | View toggle between grid and table | useViewStore already has agentView: "grid" | "table" and setAgentView(). Just need toggle UI buttons. |
| AGNT-04 | Filters bar -- status (All/Active/Idle/Disabled), model (All/Opus/Sonnet), uptime threshold | useFilterStore already has agentFilters with status/llm_model. API supports these filters. Uptime threshold is client-side filter. |
| AGNT-05 | Context menu actions -- restart, view logs, disable (danger) | Custom context menu component (no Radix). Actions are mock/toast only in v1 (no Gateway integration). |
| AGNT-06 | Disabled agents at reduced opacity, error agents with red border | Conditional Tailwind classes on Card: opacity-50 for disabled, border-danger for error. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech stack**: React 19, TypeScript, Tailwind CSS v4, vite_rails
- **Serialization**: jbuilder for JSON responses -- no AMS
- **Testing**: RSpec + Factory Bot for backend, Playwright for E2E
- **State management**: TanStack Query for server state, Zustand for UI state
- **Charts**: Recharts for all charts including sparklines
- **Icons**: Font Awesome 6.x (fa-solid weight)
- **Styling**: Tailwind CSS + clsx + tailwind-merge via cn() utility
- **App location**: Rails app in `source/dashboard`
- **No axios**: Use native fetch via apiFetch/apiMutate wrappers
- **No Redux**: Zustand for UI state
- **Toast notifications**: sonner (not yet installed)

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react | ^19.2.4 | UI framework | Installed |
| @tanstack/react-query | ^5.95.2 | Server state / data fetching | Installed |
| zustand | ^5.0.12 | UI state (view toggle, filters) | Installed |
| @fortawesome/react-fontawesome | ^3.3.0 | Icons for agent cards, context menu | Installed |
| @fortawesome/free-solid-svg-icons | ^6.7.2 | Icon pack (faRobot, faEllipsisVertical, etc.) | Installed |
| date-fns | ^4.1.0 | Uptime formatting ("2d 5h", "Just now") | Installed |
| clsx | ^2.1.1 | Conditional classNames | Installed |
| tailwind-merge | ^3.5.0 | Tailwind class conflict resolution | Installed |

### New Dependencies (Must Install)

| Library | Version | Purpose | Why Needed |
|---------|---------|---------|------------|
| recharts | ^3.8.1 | Token usage sparkline in agent cards | CLAUDE.md specifies Recharts for all charts. Needed for AGNT-01 sparkline. Current latest: 3.8.1. |
| sonner | ^2.0.7 | Toast notifications for context menu actions | CLAUDE.md specifies sonner for toasts. Needed for AGNT-05 (restart/disable feedback). Current latest: 2.0.7. |

**Installation:**
```bash
cd source/dashboard && npm install recharts@^3.8.1 sonner@^2.0.7
```

**Version verification:** recharts 3.8.1, sonner 2.0.7 confirmed via `npm view` on 2026-03-27.

## Architecture Patterns

### Recommended Project Structure

```
app/frontend/
  components/
    agents/
      AgentCard.tsx           # Single agent card for grid view (AGNT-01)
      AgentGrid.tsx           # Grid layout of AgentCard components
      AgentTable.tsx          # Table view with sortable columns (AGNT-02)
      AgentFilters.tsx        # Status/model filter bar (AGNT-04)
      AgentViewToggle.tsx     # Grid/table toggle buttons (AGNT-03)
      AgentContextMenu.tsx    # Right-click / ellipsis menu (AGNT-05)
      Sparkline.tsx           # Recharts-based mini line chart (reusable)
    pages/
      AgentsPage.tsx          # Page-level composition (replaces placeholder)
    ui/
      ...                     # Existing design system (Card, Badge, Table, etc.)
  hooks/
    useAgents.ts              # Already exists -- may need minor updates
  types/
    api.ts                    # Already has Agent interface -- needs enrichment
  stores/
    filterStore.ts            # Already has agentFilters -- works as-is
    viewStore.ts              # Already has agentView -- works as-is
```

### Pattern 1: Enriched API Response

**What:** The Agent API currently returns basic fields only. The agent cards and table need `current_task` (title of in-progress task) and `tokens_7d` (total tokens last 7 days) per agent.

**When to use:** When the frontend needs computed/associated data that belongs to the agent context.

**Approach:** Enrich the jbuilder partial to include associated data. The AgentService already eager-loads nothing; add includes for tasks and a computed token summary.

```ruby
# app/views/api/v1/agents/_agent.json.jbuilder (enriched)
json.extract! agent, :id, :name, :agent_id, :status, :llm_model, :workspace
json.uptime_since agent.uptime_since&.iso8601
json.created_at agent.created_at.iso8601
json.updated_at agent.updated_at.iso8601

# Enriched fields
json.current_task agent.tasks.find_by(status: 'in_progress')&.title
json.tokens_7d agent.usage_records.where(recorded_at: 7.days.ago..).sum('input_tokens + output_tokens')
```

**Important:** This creates N+1 queries. Mitigate in the service layer:

```ruby
# AgentService.list -- add preloading
scope = Agent.includes(:tasks).all
# tokens_7d loaded via a single aggregation query, then mapped onto agents
```

### Pattern 2: Client-Side View Toggle with Zustand

**What:** Toggle between grid and table views using the existing `useViewStore`.

**When to use:** When both views share the same data source but differ only in presentation.

**Example:**
```typescript
// AgentsPage.tsx composition pattern
const agentView = useViewStore((s) => s.agentView);
const { agentFilters } = useFilterStore();
const { data, isLoading } = useAgents({ ...agentFilters });

return (
  <>
    <AgentFilters />
    <AgentViewToggle />
    {agentView === 'grid' ? (
      <AgentGrid agents={data?.data ?? []} />
    ) : (
      <AgentTable agents={data?.data ?? []} />
    )}
  </>
);
```

### Pattern 3: Recharts Sparkline (Minimal Config)

**What:** A tiny line chart (no axes, no legend, no tooltip) showing 7-day token usage trend.

**When to use:** Inline in agent cards for at-a-glance trend visualization.

**Example:**
```typescript
// Sparkline.tsx -- reusable across dashboard
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = '#00d4aa', height = 32 }: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Note:** Sparkline data can come from the API as an array of daily token totals (7 values). This requires an additional field in the agent API response or a separate endpoint. For simplicity, compute it in the jbuilder view as a 7-element array.

### Pattern 4: Custom Context Menu (No Radix)

**What:** A dropdown menu triggered by an ellipsis button (three dots) on agent cards. Not a right-click menu -- triggered by click on the ellipsis icon.

**When to use:** Project doesn't use Radix/headless UI. Build a simple positioned dropdown with click-outside handling.

**Example:**
```typescript
// AgentContextMenu.tsx
function AgentContextMenu({ agent, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-md shadow-lg z-50">
      <button className="w-full px-4 py-2 text-sm text-left hover:bg-surface-hover">Restart</button>
      <button className="w-full px-4 py-2 text-sm text-left hover:bg-surface-hover">View Logs</button>
      <button className="w-full px-4 py-2 text-sm text-left text-danger hover:bg-danger/10">Disable</button>
    </div>
  );
}
```

### Pattern 5: Conditional Styling for Agent States (AGNT-06)

**What:** Disabled agents render at reduced opacity; error agents show a red border.

**Example:**
```typescript
<Card
  className={cn(
    agent.status === 'disabled' && 'opacity-50',
    agent.status === 'error' && 'border-danger',
  )}
>
```

### Anti-Patterns to Avoid

- **Fetching usage records client-side per agent**: Do NOT make N separate API calls for sparkline data. Compute token aggregates server-side in a single query and include in the agent API response.
- **Using Canvas for sparklines**: Recharts uses SVG. Do not import a separate Canvas library -- the data volume (6 agents x 7 data points) is trivial for SVG.
- **Building a generic dropdown/popover library**: The context menu is simple enough to be a one-off component. No need for a generic Popover primitive.
- **Sorting in the frontend for paginated data**: If the API returns paginated results, client-side sort only works on the current page. Use API sort params via useAgents hook.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sparkline chart | Custom SVG path calculation | Recharts `LineChart` with hidden axes | Recharts handles responsive sizing, anti-aliasing, data scaling |
| Toast notifications | Custom notification system | sonner `toast()` | Handles stacking, auto-dismiss, persistence across routes |
| Class merging | String concatenation for conditional classes | `cn()` (clsx + tailwind-merge) | Resolves Tailwind class conflicts correctly |
| Relative time | Manual date math for "2d 5h ago" | date-fns `formatDistanceToNow` or custom formatter | Edge cases with timezones, null dates, future dates |
| Status-to-color mapping | Inline ternary chains | Lookup Record maps (already used in Badge/StatusDot) | Extensible, type-safe, consistent |

## Common Pitfalls

### Pitfall 1: N+1 Queries for Agent Enrichment

**What goes wrong:** Adding `current_task` and `tokens_7d` to the jbuilder partial without preloading causes N+1 queries (one per agent for tasks, one per agent for usage_records).
**Why it happens:** jbuilder partials access associations lazily.
**How to avoid:** In `AgentService.list`, use `Agent.includes(:tasks)` and pre-compute token totals in a single aggregation query, then attach to each agent via a hash lookup.
**Warning signs:** Slow API responses, N+2 queries per agent in Rails logs.

### Pitfall 2: ResponsiveContainer Height Zero

**What goes wrong:** Recharts `ResponsiveContainer` renders with zero height if its parent doesn't have an explicit height.
**Why it happens:** ResponsiveContainer uses 100% width by default but needs a parent with defined dimensions.
**How to avoid:** Always set `height={32}` (or desired pixel value) on ResponsiveContainer for sparklines. Do NOT rely on percentage height.
**Warning signs:** Sparkline area is blank/invisible.

### Pitfall 3: Zustand Filter Store Merge vs Replace

**What goes wrong:** Calling `setAgentFilters({ status: 'active' })` merges with existing filters (spreading state). If a user "clears" a filter by omitting it, old filter values persist.
**Why it happens:** The current `setAgentFilters` merges: `{ ...state.agentFilters, ...filters }`.
**How to avoid:** When clearing a specific filter, explicitly set it to `undefined` or use `resetAgentFilters()` for full reset. Or replace the entire filter object.
**Warning signs:** Stale filter state after user interaction.

### Pitfall 4: Context Menu Z-Index Stacking

**What goes wrong:** Context menu dropdown appears behind other cards or behind the sidebar.
**Why it happens:** Without proper z-index, positioned elements stack in DOM order.
**How to avoid:** Use `z-50` on the menu, ensure the card with an open menu has `relative` positioning, and add a click-outside handler to dismiss.
**Warning signs:** Menu items unclickable, appearing partially hidden.

### Pitfall 5: Table Sort State Mismatch with API

**What goes wrong:** Client displays sort arrow for one column but API returns data sorted differently.
**Why it happens:** Sort state stored in component but not synced with useAgents params.
**How to avoid:** Derive sort params from a single source of truth (component state or URL params) and pass directly to useAgents hook. The hook's queryKey includes params, so changing sort triggers a refetch.
**Warning signs:** Table data doesn't change when clicking sort headers.

### Pitfall 6: Agent Status Enum Mismatch

**What goes wrong:** Frontend checks `agent.status === 'active'` but API returns different casing or values.
**Why it happens:** Rails enum maps to string values. The TypeScript Agent type already defines the union correctly.
**How to avoid:** Use the existing TypeScript union type `"active" | "idle" | "error" | "disabled"` and the status-to-color maps from design system components.
**Warning signs:** Status badges showing wrong colors or missing.

## Code Examples

### Verified: Agent Status to Badge Color Mapping

```typescript
// Map agent status to Badge color prop (existing Badge component)
const statusColorMap: Record<Agent['status'], 'success' | 'danger' | 'warning' | 'idle'> = {
  active: 'success',
  idle: 'idle',
  error: 'danger',
  disabled: 'idle',
};

// Usage in AgentCard
<Badge color={statusColorMap[agent.status]} dot pulse={agent.status === 'active'}>
  {agent.status}
</Badge>
```

### Verified: Uptime Formatting with date-fns

```typescript
import { formatDistanceToNow } from 'date-fns';

function formatUptime(uptimeSince: string | null): string {
  if (!uptimeSince) return '--';
  return formatDistanceToNow(new Date(uptimeSince), { addSuffix: false });
}
// "2 days" / "5 hours" / "about 1 month"
```

### Verified: Filter Bar Using Existing Button Component

```typescript
// Status filter buttons
const statuses = ['All', 'Active', 'Idle', 'Error', 'Disabled'] as const;

{statuses.map((s) => (
  <Button
    key={s}
    variant={currentFilter === s.toLowerCase() ? 'primary' : 'secondary'}
    size="sm"
    onClick={() => setFilter(s === 'All' ? undefined : s.toLowerCase())}
  >
    {s}
  </Button>
))}
```

### Verified: Enriched Agent TypeScript Interface

```typescript
// Extend existing Agent type for enriched API response
export interface Agent {
  id: string;
  name: string;
  agent_id: string;
  status: "active" | "idle" | "error" | "disabled";
  llm_model: string | null;
  workspace: string | null;
  uptime_since: string | null;
  created_at: string;
  updated_at: string;
  // Enriched fields (Phase 5)
  current_task: string | null;
  tokens_7d: number;
  tokens_7d_series: number[];  // 7 daily values for sparkline
}
```

### Verified: Sonner Toast for Context Menu Actions

```typescript
import { toast } from 'sonner';

function handleRestart(agent: Agent) {
  // Mock action (no Gateway in v1)
  toast.success(`Restart signal sent to ${agent.name}`);
}

function handleDisable(agent: Agent) {
  // Optimistic UI update via React Query cache
  toast.success(`${agent.name} has been disabled`);
}
```

## API Enrichment Details

### Current Agent API Response Shape

```json
{
  "id": "uuid",
  "name": "docs-writer",
  "agent_id": "agt_docs01",
  "status": "active",
  "llm_model": "opus",
  "workspace": "~/projects/docs",
  "uptime_since": "2026-03-25T10:00:00Z",
  "created_at": "2026-03-25T10:00:00Z",
  "updated_at": "2026-03-27T10:00:00Z"
}
```

### Required Enriched Response Shape

```json
{
  "id": "uuid",
  "name": "docs-writer",
  "agent_id": "agt_docs01",
  "status": "active",
  "llm_model": "opus",
  "workspace": "~/projects/docs",
  "uptime_since": "2026-03-25T10:00:00Z",
  "created_at": "2026-03-25T10:00:00Z",
  "updated_at": "2026-03-27T10:00:00Z",
  "current_task": "Write API documentation for v2 endpoints",
  "tokens_7d": 245000,
  "tokens_7d_series": [32000, 45000, 38000, 41000, 28000, 33000, 28000]
}
```

### Backend Enrichment Strategy

To avoid N+1 queries, pre-compute in `AgentService.list`:

```ruby
# 1. Fetch agents with preloaded in-progress tasks
agents = Agent.includes(:tasks).where(...)

# 2. Single query for 7-day token totals per agent
token_totals = UsageRecord
  .where(recorded_at: 7.days.ago..)
  .group(:agent_id)
  .sum('input_tokens + output_tokens')

# 3. Single query for daily token series (7 rows per agent)
daily_series = UsageRecord
  .where(recorded_at: 7.days.ago..)
  .group(:agent_id, "DATE(recorded_at)")
  .order("DATE(recorded_at)")
  .sum('input_tokens + output_tokens')

# 4. Attach computed data via virtual attributes or controller-level assignment
```

The jbuilder partial then accesses pre-computed data rather than lazy-loading associations.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-sparklines | Recharts LineChart (minimal config) | 2024 | react-sparklines not actively maintained; Recharts is the project standard |
| Right-click context menu | Click-triggered dropdown menu | 2025 | Better mobile support, more discoverable |
| Client-side filtering of full dataset | Server-side filtering via API params | 2024+ | Correct for paginated data; API already supports filters |
| Separate data fetches for enriched fields | Single enriched API response | Standard | Reduces HTTP requests, simplifies React code |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.4 + Factory Bot 6.5.1 |
| Config file | `source/dashboard/spec/rails_helper.rb` |
| Quick run command | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/agents_spec.rb` |
| Full suite command | `cd source/dashboard && bundle exec rspec` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AGNT-01 | Agent API returns enriched fields (current_task, tokens_7d, tokens_7d_series) | unit (request spec) | `bundle exec rspec spec/requests/api/v1/agents_spec.rb -x` | Exists (needs new examples) |
| AGNT-02 | Agent API supports sort param for all table columns | unit (request spec) | `bundle exec rspec spec/requests/api/v1/agents_spec.rb -x` | Exists (needs sort examples) |
| AGNT-03 | View toggle stores state correctly | n/a (UI-only, Zustand) | Zustand store already exists and works | n/a |
| AGNT-04 | Agent API filters by status and llm_model | unit (request spec) | `bundle exec rspec spec/requests/api/v1/agents_spec.rb -x` | Exists (status filter test exists, llm_model test needed) |
| AGNT-05 | Agent update endpoint supports status change (for disable action) | unit (request spec) | `bundle exec rspec spec/requests/api/v1/agents_spec.rb -x` | Needs new PATCH test |
| AGNT-06 | Agents with error/disabled status get correct CSS classes | manual / E2E | Playwright E2E | Not yet |

### Sampling Rate

- **Per task commit:** `cd source/dashboard && bundle exec rspec spec/requests/api/v1/agents_spec.rb -x`
- **Per wave merge:** `cd source/dashboard && bundle exec rspec`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] Add request spec examples for enriched agent fields (current_task, tokens_7d, tokens_7d_series)
- [ ] Add request spec for PATCH /api/v1/agents/:id (status change for disable)
- [ ] Add request spec for llm_model filter parameter
- [ ] Add request spec for sort parameter validation

## Open Questions

1. **Sparkline data granularity**
   - What we know: AGNT-01 says "token usage sparkline" and AGNT-02 says "tokens (7d)"
   - What's unclear: Should sparkline show daily totals (7 points) or hourly (168 points)?
   - Recommendation: Use 7 daily aggregated points. Fewer points render cleaner in a 80-100px wide sparkline. The seed data has hourly records, so aggregate by DATE().

2. **Context menu actions are mock-only**
   - What we know: v1 has no Gateway integration. Restart/disable/view-logs are listed as v2 requirements.
   - What's unclear: Should "disable" actually update the agent status in the DB, or just show a toast?
   - Recommendation: "Disable" should PATCH the agent status to "disabled" via the existing update endpoint. "Restart" and "View Logs" show toast-only feedback (no backend action). This gives the UI real state changes to demonstrate while keeping scope manageable.

3. **Uptime threshold filter (AGNT-04)**
   - What we know: Requirement says "uptime threshold" as a filter option alongside status and model.
   - What's unclear: What values? Slider? Dropdown?
   - Recommendation: Implement as a simple dropdown with options: "All", "> 1 hour", "> 24 hours", "> 7 days". Filter client-side since uptime is computed from uptime_since.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: Agent model, AgentService, API controller, jbuilder views, TypeScript types, React hooks, Zustand stores -- all verified by direct file reads
- CLAUDE.md: Technology stack decisions, library choices, version constraints
- Recharts documentation: LineChart, ResponsiveContainer -- verified minimal sparkline pattern
- npm registry: recharts@3.8.1, sonner@2.0.7 -- verified latest versions

### Secondary (MEDIUM confidence)
- [Recharts GitHub](https://github.com/recharts/recharts) - Sparkline implementation via minimal LineChart
- [Recharts ResponsiveContainer guide](https://www.dhiwise.com/post/simplify-data-visualization-with-recharts-responsivecontainer) - Height requirement for ResponsiveContainer
- [Tremor SparkChart](https://www.tremor.so/docs/visualizations/spark-chart) - Recharts-based sparkline pattern reference

### Tertiary (LOW confidence)
- Context menu implementation patterns from community discussions -- no authoritative single source, but the pattern (click-triggered dropdown + click-outside dismiss) is well-established

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries specified in CLAUDE.md, versions verified against npm
- Architecture: HIGH - Building on verified existing patterns (hooks, stores, components) from Phase 4
- API enrichment: HIGH - ActiveRecord associations, jbuilder patterns well understood from existing code
- Pitfalls: HIGH - N+1 queries and ResponsiveContainer height are well-documented Recharts/Rails issues
- Context menu: MEDIUM - Custom implementation without Radix; simple but needs careful z-index/positioning

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable stack, no fast-moving dependencies)
