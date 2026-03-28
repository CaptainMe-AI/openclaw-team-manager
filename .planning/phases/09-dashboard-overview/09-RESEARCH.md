# Phase 9: Dashboard Overview - Research

**Researched:** 2026-03-27
**Domain:** Dashboard composition, KPI cards with trends, activity timeline visualization, cross-page integration
**Confidence:** HIGH

## Summary

Phase 9 replaces the `DashboardPage` placeholder with the primary overview screen -- the operator's landing page. This phase is an **integration layer** that composes existing patterns and components rather than introducing new technology. All dependency phases (5-8) are complete, meaning the API endpoints, data hooks, UI components (Card, Badge, StatusDot, Button, Sparkline, Modal), the approval card with inline approve/deny, and the task creation modal are all built and ready to reuse.

The work divides into two areas: (1) **backend enhancement** -- the `DashboardService` needs a time-period parameter, trend indicators (percentage change vs previous period), and an agent activity timeline endpoint producing timestamped events; (2) **frontend composition** -- four KPI cards using the exact pattern from `UsageKpiCards`, an agent activity timeline with color-coded dots, a recent tasks table with expandable rows, an action required sidebar with reused `ApprovalCard` components, a time period selector dropdown, and a "New Task" button triggering the existing `NewTaskModal`.

The existing `DashboardService.summary` returns counts and recent records but is hardcoded to 24 hours with no trends. The `DashboardData` TypeScript interface matches the current API shape. Both need extension for time-period support and trend data. The `UsageService.summary_with_trends` pattern (compare current vs previous period) should be replicated in `DashboardService`.

**Primary recommendation:** Extend `DashboardService` with time-period parameter and trend computation. Build the activity timeline from existing model timestamps (agent status changes, task state transitions, approval events) as a synthetic event feed. Frontend composes five sections in a responsive grid: KPI row, timeline, main content area (recent tasks), and sidebar (action required + new task button).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | KPI cards -- active agents count, tasks in progress, pending approvals, tokens used (24h) with trend indicators | DashboardService already returns all 4 counts. Add trend computation by comparing current vs previous period (same pattern as UsageService.summary_with_trends). Frontend uses Card + icon + TrendBadge pattern proven in UsageKpiCards. |
| DASH-02 | Agent activity timeline -- horizontal timeline with color-coded event dots (green/blue/amber/red), hover tooltips | New. Build synthetic events from agent updated_at + status (green=active, gray=idle), task created_at/updated_at (blue=task event), approval requested_at (amber=pending, red=denied, green=approved). Backend returns sorted event list. Frontend renders as horizontal scrollable timeline with StatusDot + Tooltip. |
| DASH-03 | Recent tasks table -- 5 rows, expandable, columns: task name, agent, status badge, duration, timestamp | DashboardService.summary already returns recent_tasks (5 records). Frontend needs a DashboardTasksTable with expandable row detail (description). Reuses Badge for status, date-fns for duration/timestamp formatting. |
| DASH-04 | Action required sidebar -- top pending approvals with inline approve/deny buttons | DashboardService.summary already returns pending_approval_items (5 records). Reuse existing ApprovalCard component (already has approve/deny with mutations). Compact rendering variant for sidebar layout. |
| DASH-05 | Time period selector dropdown (default: Last 24 Hours) | New. Add time_period param to DashboardController and DashboardService. Frontend dropdown (select or button group) passes parameter to useDashboard hook. Pattern from UsageTimePeriod selector. |
| DASH-06 | "New Task" button opening Create New Task modal | Existing NewTaskModal component ready to use. Add button in dashboard header that toggles modal open state. Direct reuse, no new components needed. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech stack**: Ruby 3.3.3, Rails 8.0.5, React 19, PostgreSQL 17, Vite, Tailwind CSS v4
- **App location**: Rails app in `source/dashboard`
- **Serialization**: jbuilder for JSON responses
- **Testing**: RSpec, Factory Bot, Faker, RuboCop before commits
- **Frontend state**: TanStack Query for server state, Zustand for UI state
- **Charts**: Recharts for visualization
- **Icons**: Font Awesome 6.7.x
- **Styling**: Tailwind CSS v4 CSS-first config, dark-mode only
- **Formatting**: date-fns for date formatting
- **Notifications**: sonner for toast notifications

## Standard Stack

### Core (Already Installed -- No New Dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.8.1 | Optional: sparkline in KPI cards if desired | Already installed, proven in Sparkline and Phase 8 charts |
| @tanstack/react-query | 5.95.2 | useDashboard hook with time-period parameter | Already installed. Hook exists at hooks/useDashboard.ts |
| zustand | 5.0.12 | dashboardTimePeriod UI state if persisted across navigation | Already installed. filterStore already has pattern |
| date-fns | 4.1.0 | formatDistanceToNow for timeline tooltips, duration formatting | Already installed |
| @fortawesome/free-solid-svg-icons | 6.7.x | KPI card icons: faRobot, faListCheck, faShieldHalved, faCoins | Already installed |
| sonner | 2.x | Toast notifications for approve/deny actions | Already installed, used in ApprovalCard |

### Supporting (No New Dependencies)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | 2.1.1 + 3.5.0 | cn() utility | Conditional classes throughout |

**No new npm packages or gems required for this phase.**

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom timeline component | Recharts ScatterChart for timeline dots | Recharts is overkill for a simple dot timeline. Custom div-based timeline is simpler, more accessible, and matches the design system better. |
| Dropdown for time period | Button group (like Usage page) | Dropdown saves space in the dashboard header. Button group is more immediate but takes more horizontal space. Use dropdown since DASH-05 says "dropdown". |
| Standalone approval cards in sidebar | Embed full ApprovalCard component | Full ApprovalCard is too tall for a compact sidebar. Use a condensed variant that shows title, risk badge, agent, and approve/deny buttons without the expand/detail functionality. |

## Architecture Patterns

### Recommended Project Structure
```
source/dashboard/
  app/
    services/
      dashboard_service.rb          # Extended: time_period param, trends, activity events
    controllers/api/v1/
      dashboard_controller.rb       # Extended: accept time_period param
    views/api/v1/dashboard/
      show.json.jbuilder            # Extended: trend fields, activity_events
    frontend/
      components/
        dashboard/
          DashboardKpiCards.tsx      # 4 KPI cards with trend indicators
          ActivityTimeline.tsx       # Horizontal timeline with color-coded dots
          RecentTasksTable.tsx       # 5-row expandable table
          ActionRequired.tsx         # Pending approvals sidebar with inline actions
          DashboardTimePeriod.tsx    # Time period dropdown selector
        pages/
          DashboardPage.tsx          # Composed page (replaces placeholder)
      hooks/
        useDashboard.ts             # Extended: accept time_period param
      types/
        api.ts                      # Extended: DashboardData with trends + events
```

### Pattern 1: KPI Cards with Trend Indicators
**What:** Row of 4 metric cards, each with icon, label, value, and percentage trend
**When to use:** Dashboard summary view
**Example:**
```typescript
// Pattern proven in UsageKpiCards.tsx
interface DashboardKpiConfig {
  title: string;
  icon: IconDefinition;
  colorClass: string;
  bgClass: string;
  getValue: (d: DashboardData) => string | number;
  getTrend: (d: DashboardData) => number | null;
  trendInverted: boolean; // true = "up is bad" (e.g., for pending approvals)
}

const kpiConfig: DashboardKpiConfig[] = [
  {
    title: "Active Agents",
    icon: faRobot,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    getValue: (d) => d.active_agents,
    getTrend: (d) => d.active_agents_trend,
    trendInverted: false, // more agents = good
  },
  // ... tasks_in_progress, pending_approvals, tokens_used_24h
];
```

### Pattern 2: Activity Timeline from Synthetic Events
**What:** Backend constructs an event feed from multiple model timestamps
**When to use:** The timeline in DASH-02
**Example:**
```ruby
# DashboardService -- build activity events
def self.activity_events(from:, to:, limit: 20)
  events = []

  # Agent status changes (use updated_at as proxy)
  Agent.where(updated_at: from..to).find_each do |agent|
    events << {
      type: agent.status,           # active, idle, error, disabled
      label: "#{agent.name} became #{agent.status}",
      agent_name: agent.name,
      occurred_at: agent.updated_at
    }
  end

  # Task state transitions
  Task.where(updated_at: from..to).includes(:agent).find_each do |task|
    events << {
      type: 'task',
      label: "#{task.title} - #{task.status}",
      agent_name: task.agent&.name,
      occurred_at: task.updated_at
    }
  end

  # Approval events
  Approval.where(requested_at: from..to).or(Approval.where(resolved_at: from..to))
    .includes(:agent).find_each do |approval|
    events << {
      type: approval.status,  # pending, approved, denied
      label: approval.title,
      agent_name: approval.agent&.name,
      occurred_at: approval.resolved_at || approval.requested_at
    }
  end

  events.sort_by { |e| e[:occurred_at] }.last(limit)
end
```

### Pattern 3: Reusing ApprovalCard in Compact Mode
**What:** The ApprovalCard component already handles approve/deny with mutations and toast notifications
**When to use:** Action Required sidebar (DASH-04)
**Example:**
```typescript
// Option A: Reuse ApprovalCard directly (simplest)
// It already has approve/deny buttons, mutation hooks, toast feedback
// Just render without expand behavior (pass isExpanded=false, no toggle)

// Option B: Build a more compact DashboardApprovalItem
// For tighter layout -- shows just title, risk badge, agent, approve/deny
// Still uses useApproveApproval() and useDenyApproval() hooks
```

### Pattern 4: Expandable Table Rows
**What:** Table rows that expand to show additional detail on click
**When to use:** Recent tasks table (DASH-03) needs expandable rows
**Example:**
```typescript
// Managed via local state (same pattern as ApprovalCard expand in ApprovalsPage)
const [expandedId, setExpandedId] = useState<string | null>(null);

function toggleExpanded(id: string) {
  setExpandedId(prev => prev === id ? null : id);
}

// Row renders description/detail when expandedId matches
```

### Pattern 5: Time Period with API Parameter
**What:** Dashboard time scope changes what the API returns
**When to use:** DASH-05 time period selector
**Example:**
```typescript
// Extend useDashboard to accept time range
export function useDashboard(timePeriod: string = "24h") {
  return useQuery({
    queryKey: ["dashboard", timePeriod],
    queryFn: () => apiFetch<DashboardData>("/api/v1/dashboard", { time_period: timePeriod }),
    staleTime: 15_000,
  });
}
```

### Anti-Patterns to Avoid
- **Fetching raw data and aggregating client-side:** DashboardService must return pre-computed KPI values and trends. The UsageService pattern (SQL aggregation) is the right approach.
- **Building a new approval component when ApprovalCard exists:** Reuse the existing component or extract shared logic. Don't duplicate mutation hooks.
- **Hardcoding time period to 24h without API parameter:** The controller must accept the time_period param so the selector actually works.
- **Using a full Recharts chart for the timeline:** The activity timeline is a simple row of dots, not a chart. A custom CSS/div-based component is cleaner and more accessible.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Trend percentage computation | Custom math in frontend | DashboardService trend computation (same as UsageService.percent_change) | Server-side avoids sending previous period data to client |
| Approve/deny mutation logic | New mutation hooks | Existing useApproveApproval() and useDenyApproval() from hooks/useApprovals.ts | Already built with cache invalidation for both approvals and dashboard query keys |
| Task creation modal | New modal component | Existing NewTaskModal from components/tasks/NewTaskModal.tsx | Fully implemented with validation, agent dropdown, priority selector |
| Date/time formatting | Manual date strings | date-fns: formatDistanceToNow, format, differenceInMinutes | Handles timezone, locale, relative time consistently |
| Conditional class composition | String concatenation | cn() utility from lib/utils.ts | Handles Tailwind class conflicts via tailwind-merge |

**Key insight:** Phase 9 is fundamentally a composition phase. Every major piece (approval actions, task creation, KPI rendering pattern, toast notifications, badge/card components) already exists. The primary new work is: (1) DashboardService time-period and trend enhancement, (2) activity timeline component, (3) layout composition of the page.

## Common Pitfalls

### Pitfall 1: Dashboard Query Invalidation on Approve/Deny
**What goes wrong:** User approves an item in the dashboard sidebar but KPI counts (pending_approvals) don't update.
**Why it happens:** Approval mutations already invalidate `["dashboard"]` query key (verified in useApprovals.ts), but only if the dashboard hook query key matches.
**How to avoid:** Ensure useDashboard query key includes the time period parameter: `["dashboard", timePeriod]`. The existing invalidation `queryKey: ["dashboard"]` uses prefix matching, so `["dashboard", "24h"]` will be invalidated correctly.
**Warning signs:** Stale counts after approve/deny action in sidebar.

### Pitfall 2: N+1 Queries in Activity Timeline
**What goes wrong:** Loading events from agents, tasks, and approvals causes many SQL queries if not eager-loaded.
**Why it happens:** Building synthetic events from three separate models requires careful includes().
**How to avoid:** Use `.includes(:agent)` on tasks and approvals. Keep the event query limit reasonable (20-30 events max). Consider a single SQL UNION query for better performance.
**Warning signs:** Slow dashboard load time, high query count in Rails logs.

### Pitfall 3: Time Period Selector Not Affecting All Sections
**What goes wrong:** Changing time period only affects KPI cards but not recent tasks or activity timeline.
**Why it happens:** Recent tasks and approvals may not be filtered by time period, or the parameter is not passed through to all service methods.
**How to avoid:** DashboardService.summary must accept a `from:` and `to:` parameter that applies to ALL returned data sections (KPI counts within period, tokens within period, recent tasks within period, activity events within period). The counts (active_agents, tasks_in_progress, pending_approvals) are real-time snapshots and should NOT change with time period -- only tokens_used, recent_tasks list, and activity timeline should be time-scoped.
**Warning signs:** Counter-intuitive: active agents should always show current count regardless of time filter.

### Pitfall 4: Compact Approval Card Layout Breaking on Long Titles
**What goes wrong:** Approval titles overflow the sidebar in the "Action Required" section.
**Why it happens:** Dashboard sidebar is narrower than the full-width approvals page.
**How to avoid:** Use `truncate` class on title, ensure the card layout uses `min-w-0` on flex children, and test with long approval titles from seed data.
**Warning signs:** Horizontal scrollbar appearing, broken layout on smaller screens.

### Pitfall 5: Modal Overlap with Dashboard Content
**What goes wrong:** Opening the NewTaskModal from the dashboard may have z-index issues with the sidebar or other overlapping elements.
**Why it happens:** Modal component already handles this via portal rendering, but if the dashboard layout uses `overflow: hidden` or `position: relative` with z-index, issues can appear.
**How to avoid:** The existing Modal component uses a portal (renders at document root). Don't add position/z-index to dashboard layout containers unnecessarily.
**Warning signs:** Modal backdrop not covering sidebar, or modal appearing behind content.

## Code Examples

Verified patterns from the existing codebase:

### DashboardService Extension Pattern
```ruby
# Source: Based on existing UsageService.summary_with_trends pattern
class DashboardService
  def self.summary(from: 24.hours.ago, to: Time.current)
    usage_scope = UsageRecord.where(recorded_at: from..to)

    current = {
      **realtime_counts,
      tokens_used: usage_scope.sum('input_tokens + output_tokens'),
      cost_cents: usage_scope.sum(:cost_cents),
      recent_tasks: Task.where(created_at: from..to).order(created_at: :desc).limit(5),
      pending_approval_items: Approval.pending.order(requested_at: :asc).limit(5).includes(:agent),
      activity_events: activity_events(from: from, to: to)
    }

    # Add trends by comparing with previous period of same duration
    previous_usage = UsageRecord.where(recorded_at: (from - (to - from))..from)
    current[:tokens_trend] = percent_change(
      previous_usage.sum('input_tokens + output_tokens'),
      current[:tokens_used]
    )

    current
  end
end
```

### KPI Card Rendering Pattern
```typescript
// Source: Proven pattern from components/usage/UsageKpiCards.tsx
// Exact same structure: icon + label + trend badge + mono value
<Card>
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${kpi.bgClass} flex items-center justify-center`}>
        <FontAwesomeIcon icon={kpi.icon} className={`text-base ${kpi.colorClass}`} />
      </div>
      <span className="text-xs text-text-secondary">{kpi.title}</span>
    </div>
    <TrendBadge value={kpi.getTrend(data)} inverted={kpi.trendInverted} />
  </div>
  <span className="font-mono text-2xl font-semibold text-text-primary">
    {kpi.getValue(data)}
  </span>
</Card>
```

### Activity Timeline Dot Pattern
```typescript
// Source: StatusDot component already supports all needed colors
// green (active/approved), blue (task), amber (pending/warning), red (error/denied)
const eventColorMap: Record<string, StatusDotStatus> = {
  active: "success",    // green
  approved: "success",  // green
  task: "info",         // blue
  pending: "warning",   // amber
  idle: "idle",         // gray
  error: "danger",      // red
  denied: "danger",     // red
  disabled: "offline",  // gray
};
```

### Expandable Task Row Pattern
```typescript
// Source: Pattern from ApprovalCard expand in ApprovalsPage
// Parent manages single-expand state, child receives isExpanded + toggle
{recentTasks.map((task) => (
  <div key={task.id} onClick={() => toggleExpanded(task.id)} className="cursor-pointer">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-text-primary">{task.title}</span>
      <Badge variant="status" color={statusColorMap[task.status]}>{task.status}</Badge>
    </div>
    {expandedId === task.id && (
      <div className="mt-2 text-xs text-text-secondary">{task.description}</div>
    )}
  </div>
))}
```

### Approve/Deny in Sidebar
```typescript
// Source: hooks/useApprovals.ts -- mutations already invalidate ["dashboard"] and ["approvals"]
const approveMutation = useApproveApproval();
const denyMutation = useDenyApproval();

// These hooks already handle:
// 1. PATCH /api/v1/approvals/:id/approve (or /deny)
// 2. queryClient.invalidateQueries({ queryKey: ["approvals"] })
// 3. queryClient.invalidateQueries({ queryKey: ["dashboard"] })
// So dashboard KPI counts auto-refresh after approve/deny
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| DashboardService hardcoded to 24h | Parameterized from/to with trend computation | Phase 9 (this phase) | Enables time period selector |
| DashboardData without trends | DashboardData with trend percentages per KPI | Phase 9 (this phase) | KPI cards show directional trend indicators |
| No activity timeline data | Synthetic event feed from 3 models | Phase 9 (this phase) | New visual element on dashboard |

**Deprecated/outdated:**
- None. This phase extends existing patterns without replacing them.

## Open Questions

1. **Activity timeline granularity**
   - What we know: We can build synthetic events from agent/task/approval timestamps
   - What's unclear: Whether updated_at is a reliable proxy for "status changed" (it changes on any attribute update, not just status). There is no dedicated status_changed_at column.
   - Recommendation: Use updated_at as a reasonable proxy for v1. The seed data sets updated_at close to creation time. For a future enhancement, an events/audit log table would be more accurate. Keep the event construction logic isolated in DashboardService so it's easy to swap.

2. **Time period selector scope for counts vs tokens**
   - What we know: active_agents, tasks_in_progress, pending_approvals are point-in-time snapshots. tokens_used is a cumulative metric.
   - What's unclear: Should "Active Agents" count change when user selects "Last 7 Days" vs "Last 1 Hour"?
   - Recommendation: Keep count KPIs as real-time snapshots (always current). Only tokens_used and activity_events change with time period. Trend indicators compare current period vs previous period of same duration for all KPIs.

3. **Sidebar layout: fixed width or responsive**
   - What we know: Design calls for "Action Required sidebar" -- implying a side panel.
   - What's unclear: Exact layout -- is it a true sidebar (always visible beside main content) or a section below on mobile?
   - Recommendation: Use a 2-column grid on desktop (main content 2/3, sidebar 1/3) that stacks to single column on mobile. This matches Tailwind responsive patterns used elsewhere.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.4 + Factory Bot 6.5.1 |
| Config file | source/dashboard/spec/rails_helper.rb |
| Quick run command | `cd source/dashboard && bundle exec rspec spec/services/dashboard_service_spec.rb spec/requests/api/v1/dashboard_spec.rb -x` |
| Full suite command | `cd source/dashboard && bundle exec rspec` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | KPI cards return correct counts and trends | unit + request | `cd source/dashboard && bundle exec rspec spec/services/dashboard_service_spec.rb spec/requests/api/v1/dashboard_spec.rb -x` | Partial (dashboard_spec.rb exists but no service spec, no trend tests) |
| DASH-02 | Activity events returned with correct types and sort order | unit | `cd source/dashboard && bundle exec rspec spec/services/dashboard_service_spec.rb -x` | No (dashboard_service_spec.rb does not exist) |
| DASH-03 | Recent tasks limited to 5 within time period | request | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/dashboard_spec.rb -x` | Partial (tests exist for recent_tasks array but not time-scoped) |
| DASH-04 | Pending approval items returned with agent data | request | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/dashboard_spec.rb -x` | Partial (basic array test exists) |
| DASH-05 | Time period parameter filters results | request | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/dashboard_spec.rb -x` | No (controller does not accept time_period yet) |
| DASH-06 | Task creation via modal | manual-only | N/A -- frontend interaction, relies on existing task creation API tests | N/A (existing task creation request specs cover API) |

### Sampling Rate
- **Per task commit:** `cd source/dashboard && bundle exec rspec spec/services/dashboard_service_spec.rb spec/requests/api/v1/dashboard_spec.rb -x`
- **Per wave merge:** `cd source/dashboard && bundle exec rspec`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `spec/services/dashboard_service_spec.rb` -- covers DASH-01, DASH-02, DASH-03 (service-level tests for summary with trends, activity events, time period filtering)
- [ ] Extended `spec/requests/api/v1/dashboard_spec.rb` -- covers DASH-05 (time_period parameter acceptance and filtering)

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `app/services/dashboard_service.rb` -- current DashboardService implementation
- Codebase inspection: `app/controllers/api/v1/dashboard_controller.rb` -- current controller
- Codebase inspection: `app/views/api/v1/dashboard/show.json.jbuilder` -- current jbuilder view
- Codebase inspection: `app/frontend/hooks/useDashboard.ts` -- current React Query hook
- Codebase inspection: `app/frontend/types/api.ts` -- DashboardData TypeScript interface
- Codebase inspection: `app/frontend/components/usage/UsageKpiCards.tsx` -- KPI card pattern with trends
- Codebase inspection: `app/services/usage_service.rb` -- trend computation pattern (summary_with_trends, percent_change)
- Codebase inspection: `app/frontend/hooks/useUsage.ts` -- time range parameter pattern
- Codebase inspection: `app/frontend/components/approvals/ApprovalCard.tsx` -- approve/deny component
- Codebase inspection: `app/frontend/components/tasks/NewTaskModal.tsx` -- task creation modal
- Codebase inspection: `app/frontend/stores/filterStore.ts` -- Zustand filter store patterns
- Codebase inspection: `app/frontend/components/ui/StatusDot.tsx` -- color-coded dot component
- Codebase inspection: `app/frontend/lib/formatters.ts` -- formatCompact, formatCost, formatTrend utilities

### Secondary (MEDIUM confidence)
- Pattern inference from Phase 8 research and implementation -- KPI + chart composition approach

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and proven in prior phases, no new dependencies
- Architecture: HIGH -- extends proven patterns from UsageKpiCards, UsageService, ApprovalCard, filterStore
- Pitfalls: HIGH -- identified from direct codebase analysis (query invalidation, N+1, time scoping)

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable -- no external dependency changes expected)
