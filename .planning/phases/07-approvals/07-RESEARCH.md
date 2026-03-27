# Phase 7: Approvals - Research

**Researched:** 2026-03-27
**Domain:** Approval queue UI -- expandable cards, inline actions, tabbed views, batch operations
**Confidence:** HIGH

## Summary

Phase 7 builds the Approvals page UI on top of a fully complete backend. The Approval model, ApprovalService, API controller with approve/deny endpoints, jbuilder views, React hooks (useApprovals, useApproveApproval, useDenyApproval), TypeScript types, filter store, and routing are all already in place from Phase 4. The ApprovalsPage component currently renders a placeholder skeleton.

The work is entirely frontend-focused: building expandable approval cards, inline approve/deny buttons, a batch "Approve All" action, risk level filtering, time-waiting sorting, an expanded detail panel showing agent reasoning and context, and a history tab with a table of past decisions. One backend addition is needed: a batch approve endpoint (`POST /api/v1/approvals/batch_approve`) and corresponding React hook.

**Primary recommendation:** Build in 2 plans -- Plan 01 for the batch approve endpoint + approval card components with inline actions, Plan 02 for expanded detail panel, filters, history tab, and full page composition.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| APPR-01 | Pending tab with expandable approval cards -- priority badge, title, time waiting, agent, target, description | Existing `Approval` type has all fields. `risk_level` maps to priority badge. `requested_at` enables time-waiting calculation. `approval_type` indicates target. Card component follows TaskCard/AgentCard patterns. |
| APPR-02 | Inline approve (green) and deny (red) buttons per card | `useApproveApproval()` and `useDenyApproval()` hooks exist with cache invalidation. Button component has `primary` (teal) and `danger` (red) variants. Need custom green approve button styling. |
| APPR-03 | Expanded detail panel -- agent reasoning (left), related context with commit/task links (right) | `context` JSONB field stores structured data per approval type: `{command, working_directory}` for dangerous_command, `{file_path, classification}` for sensitive_data, `{current_limit_cents, requested_limit_cents}` for budget_override. "Agent reasoning" is the `description` field. |
| APPR-04 | Risk level filter dropdown and time waiting sort | `useApprovals` hook already accepts `risk_level` filter param. `useFilterStore` has `approvalFilters` with `risk_level` field. Sort by `requested_at` is supported by ApprovalService. |
| APPR-05 | History tab -- table with timestamp, agent, action, decision badge, decided by | Fetch with `status: 'approved'` or `status: 'denied'` filter. `resolved_at` for timestamp, `agent_name` for agent, `approval_type` for action, `status` for decision badge. `resolved_by_id` exists but display name needs resolving (currently returns UUID). |
| APPR-06 | "Approve All" batch action button | No batch endpoint exists. Need `POST /api/v1/approvals/batch_approve` endpoint in controller + service, plus `useBatchApprove` hook. |
| APPR-07 | Three approval types unified in one queue: production deployment, budget override, tool access request | Model has `dangerous_command`, `sensitive_data`, `budget_override` enum values. Map to display labels: "Production Deployment", "Tool Access Request", "Budget Override". All served from same `/api/v1/approvals` endpoint. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @tanstack/react-query | ^5.95.0 | Server state, mutations, cache invalidation | Installed, hooks exist |
| zustand | ^5.0.12 | UI state (filters, expanded cards) | Installed, approvalFilters exists |
| react-router | ^7.13.2 | Routing (page already wired) | Installed, /approvals route exists |
| date-fns | ^4.x | Time formatting ("2h ago", "4d 12h 30m") | Installed, used in AgentCard/TaskCard |
| @fortawesome/react-fontawesome | ^3.3.0 | Icons | Installed |
| clsx + tailwind-merge | ^2.1.x / ^3.x | Conditional classes via cn() | Installed |
| sonner | ^2.x | Toast notifications for approve/deny feedback | Installed, used in AgentContextMenu |

### No New Packages Required

All libraries needed for this phase are already installed. No `npm install` or `bundle add` needed.

## Architecture Patterns

### Component Structure

```
app/frontend/
  components/
    approvals/
      ApprovalCard.tsx        # Expandable card with inline approve/deny
      ApprovalDetailPanel.tsx  # Expanded view: reasoning (left) + context (right)
      ApprovalFilters.tsx      # Risk level filter + sort controls
      ApprovalHistoryTable.tsx # Table for history tab
  hooks/
    useApprovals.ts           # ADD: useBatchApprove hook
  pages/
    ApprovalsPage.tsx          # REPLACE placeholder with full implementation
```

### Pattern 1: Expandable Card with Inline Actions

**What:** Approval cards that show a summary row (collapsed) and expand to reveal detail panel on click. Approve/deny buttons are visible in collapsed state.

**When to use:** When users need to quickly scan and act on items, with optional drill-down.

**Example structure:**

```tsx
// Collapsed state shows:
// [risk badge] [title] [time waiting] [agent name] [Approve] [Deny]
//
// Expanded state adds below the summary row:
// Left panel: Agent reasoning / description
// Right panel: Contextual details (command, file path, budget amounts)
```

This follows the accordion/expandable pattern. Use local React state (`expandedId`) to track which card is expanded. Only one card expanded at a time (clicking another collapses the previous).

### Pattern 2: Tab Navigation (Pending / History)

**What:** Two tabs at the top of the page -- "Pending" (default) and "History". Use local state, not routing.

**When to use:** When the two views share the same page context but show different data subsets.

**Implementation:** Simple button group toggling between `activeTab: 'pending' | 'history'`. Pending tab fetches with `status: 'pending'`, History tab fetches without status filter (or with `status: 'approved,denied'` -- but the API only supports single-value filters, so fetch all and filter client-side, or make two separate queries).

**Recommended approach for History:** Fetch all non-pending approvals. The API supports `status` as a single-value filter. Two options:
1. **Two queries** -- one for `status=approved`, one for `status=denied`, merge client-side
2. **Exclude pending** -- fetch all approvals without status filter, then filter client-side to exclude pending

Option 2 is simpler for a small dataset. But the API pagination makes client-side filtering problematic with larger datasets. **Best approach:** Add a `status` filter that accepts comma-separated values in the backend, or simply use two queries with React Query's `useQueries`. However, the simplest path for v1 mock data: just fetch all (`per_page: 100`) and filter client-side.

### Pattern 3: Batch Action with Optimistic UI

**What:** "Approve All" button that approves all currently visible pending approvals.

**Implementation:** New `POST /api/v1/approvals/batch_approve` endpoint that accepts `{ ids: [...] }`. Frontend collects all visible pending approval IDs, sends batch request, invalidates query cache on success.

### Pattern 4: Risk Level as Priority Badge

**What:** Map `risk_level` to the existing Badge component's color system.

```
critical -> danger (red)
high     -> warning (amber)
medium   -> info (blue)
low      -> idle (gray)
```

This reuses the existing Badge `variant="status"` with `color` prop, matching the visual language already established.

### Pattern 5: Approval Type Display Labels

**What:** Map internal enum values to user-friendly display strings per APPR-07.

```
dangerous_command -> "Production Deployment"
sensitive_data    -> "Tool Access Request"
budget_override   -> "Budget Override"
```

### Anti-Patterns to Avoid

- **Separate routes for Pending/History tabs:** Don't use React Router for tab switching within the same page. The Agents and Tasks pages use local state for view toggles, not routing. Follow the same pattern.
- **Approval detail as a separate page/route:** The requirement says "expanding a card" -- this is inline expansion, not navigation. Don't create an ApprovalDetailPage.
- **Storing expanded card state in Zustand:** Expanded card state is ephemeral UI state scoped to the page component. Use `useState` in ApprovalsPage, not a global store.
- **Custom fetch logic for batch approve:** Use the existing `apiMutate` utility with a new hook, not raw fetch.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time ago formatting | Custom time math | `formatDistanceToNow` from date-fns | Already used throughout the codebase (AgentCard, TaskCard, TaskListView) |
| Toast notifications | Custom notification system | `sonner` toast | Already installed, used in AgentContextMenu for action feedback |
| Conditional CSS classes | String concatenation | `cn()` from lib/utils | Standard utility used across all components |
| Filter state management | Component-local filter state | `useFilterStore` (Zustand) | Already has `approvalFilters` with `risk_level` field defined |

## Common Pitfalls

### Pitfall 1: "Resolved By" Displays UUID Instead of Name

**What goes wrong:** The approval jbuilder partial returns `resolved_by_id` as a UUID. The History tab needs to display "decided by" as a human-readable name.
**Why it happens:** The `_approval.json.jbuilder` partial does not include `resolved_by` user's display name.
**How to avoid:** Add `json.resolved_by_name approval.resolved_by&.email` (or display_name if available) to the jbuilder partial. The User model has `email` -- use that as the display identifier since there's no separate display_name field.
**Warning signs:** History table showing UUIDs in the "Decided By" column.

### Pitfall 2: Click Propagation on Approve/Deny Buttons Inside Expandable Card

**What goes wrong:** Clicking Approve or Deny also triggers the card expand/collapse.
**Why it happens:** Button click bubbles up to the card's onClick handler.
**How to avoid:** Call `e.stopPropagation()` on button click handlers, or structure the card so the clickable expand area and the button area are separate DOM elements.
**Warning signs:** Card expanding/collapsing when approving/denying.

### Pitfall 3: Stale Data After Approve/Deny Action

**What goes wrong:** After approving an item, it still appears in the Pending tab until a manual refresh.
**Why it happens:** The mutation succeeds but the query cache is not invalidated for the specific filter combination.
**How to avoid:** The existing `useApproveApproval` and `useDenyApproval` hooks already call `queryClient.invalidateQueries({ queryKey: ["approvals"] })`. This invalidates all queries starting with "approvals", including any filtered variations. This should work correctly out of the box.
**Warning signs:** Approved items lingering in the Pending tab.

### Pitfall 4: Batch Approve Sending Empty Array

**What goes wrong:** "Approve All" is clicked when no pending approvals are visible (all filtered out or already acted upon).
**Why it happens:** The button is always visible regardless of visible pending count.
**How to avoid:** Disable the "Approve All" button when there are zero pending approvals in the current view. Show a count on the button: "Approve All (5)".
**Warning signs:** Empty POST request to batch_approve endpoint.

### Pitfall 5: Context Panel Rendering Wrong Structure for Approval Type

**What goes wrong:** The expanded detail panel assumes all approvals have the same context shape.
**Why it happens:** The `context` JSONB field has different keys per approval_type.
**How to avoid:** Render context details conditionally based on `approval_type`:
- `dangerous_command`: Show `command` and `working_directory`
- `sensitive_data`: Show `file_path` and `classification`
- `budget_override`: Show `current_limit_cents` and `requested_limit_cents` (format as dollars)
**Warning signs:** "undefined" values in the context panel.

## Code Examples

### Existing API Hook Pattern (from useApprovals.ts)

```tsx
// Already exists -- use this pattern for batch approve
export function useBatchApprove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiMutate<{ approved: number }>("/api/v1/approvals/batch_approve", "POST", { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
```

### Existing Filter Pattern (from AgentFilters/TaskFilters)

```tsx
// Risk level filter follows the same button-group pattern
const riskOptions = [
  { label: "All", value: undefined },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
] as const;
```

### Time Waiting Calculation

```tsx
// Use formatDistanceToNow from date-fns (already imported in AgentCard, TaskCard)
import { formatDistanceToNow } from "date-fns";

function formatTimeWaiting(requestedAt: string): string {
  return formatDistanceToNow(new Date(requestedAt), { addSuffix: false });
}
// Renders: "2 hours", "4 days", etc.
```

### Risk Level Badge Color Mapping

```tsx
const riskColorMap: Record<Approval["risk_level"], "success" | "danger" | "warning" | "info" | "idle"> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "idle",
};
```

### Approval Type Display Labels

```tsx
const approvalTypeLabels: Record<Approval["approval_type"], string> = {
  dangerous_command: "Production Deployment",
  sensitive_data: "Tool Access Request",
  budget_override: "Budget Override",
};
```

### Batch Approve Controller Action (Rails)

```ruby
# In approvals_controller.rb
def batch_approve
  @approvals = ApprovalService.batch_approve(params[:ids], current_user)
  render json: { approved: @approvals.size }
end
```

```ruby
# In approval_service.rb
def self.batch_approve(ids, user)
  approvals = Approval.where(id: ids, status: 'pending')
  approvals.each do |approval|
    approval.update!(status: 'approved', resolved_at: Time.current, resolved_by: user)
  end
  approvals
end
```

### Expandable Card State Pattern

```tsx
// In ApprovalsPage or a parent component
const [expandedId, setExpandedId] = useState<string | null>(null);

function toggleExpanded(id: string) {
  setExpandedId(prev => prev === id ? null : id);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate detail page for each approval | Inline expandable card | Current design | All context visible without navigation |
| Approve one at a time only | Batch approve + individual | Current design | Faster queue processing for operators |

## Existing Backend Inventory

Everything needed from the backend is already built except the batch approve endpoint:

| Component | Path | Status | Phase 7 Action |
|-----------|------|--------|-----------------|
| Approval model | `app/models/approval.rb` | Complete | No changes |
| ApprovalService | `app/services/approval_service.rb` | Complete | Add `batch_approve` method |
| ApprovalsController | `app/controllers/api/v1/approvals_controller.rb` | Complete | Add `batch_approve` action |
| Routes | `config/routes.rb` | Complete | Add batch_approve collection route |
| jbuilder partial | `app/views/api/v1/approvals/_approval.json.jbuilder` | Complete | Add `resolved_by_name` field |
| Factory | `spec/factories/approvals.rb` | Complete | No changes |
| Model spec | `spec/models/approval_spec.rb` | Complete | No changes |
| Request spec | `spec/requests/api/v1/approvals_spec.rb` | Complete | Add batch_approve specs |
| Service spec | `spec/services/approval_service_spec.rb` | Complete | Add batch_approve specs |
| useApprovals hook | `app/frontend/hooks/useApprovals.ts` | Complete | Add useBatchApprove hook |
| Approval type | `app/frontend/types/api.ts` | Complete | No changes |
| Filter store | `app/frontend/stores/filterStore.ts` | Complete | No changes needed |
| ApprovalsPage | `app/frontend/components/pages/ApprovalsPage.tsx` | Placeholder | Full rewrite |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.4 + Factory Bot 6.5.1 |
| Config file | `source/dashboard/spec/rails_helper.rb` |
| Quick run command | `cd source/dashboard && bin/rspec spec/requests/api/v1/approvals_spec.rb --format documentation` |
| Full suite command | `cd source/dashboard && bin/rspec --format documentation` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| APPR-01 | Pending approval cards render with all fields | manual-only | Visual check in browser | N/A |
| APPR-02 | Inline approve/deny buttons change status | unit (request spec) | `cd source/dashboard && bin/rspec spec/requests/api/v1/approvals_spec.rb -x` | Exists |
| APPR-03 | Expanded panel shows reasoning and context | manual-only | Visual check in browser | N/A |
| APPR-04 | Risk level filter and time waiting sort | unit (request spec) | `cd source/dashboard && bin/rspec spec/requests/api/v1/approvals_spec.rb -x` | Exists (filter by risk_level) |
| APPR-05 | History tab shows past decisions | manual-only | Visual check in browser | N/A |
| APPR-06 | Batch approve endpoint | unit (request spec) | `cd source/dashboard && bin/rspec spec/requests/api/v1/approvals_spec.rb -x` | Needs batch_approve spec |
| APPR-07 | Three types unified in queue | unit (request spec) | `cd source/dashboard && bin/rspec spec/requests/api/v1/approvals_spec.rb -x` | Exists (seed data has all 3 types) |

### Sampling Rate

- **Per task commit:** `cd source/dashboard && bin/rspec spec/requests/api/v1/approvals_spec.rb spec/services/approval_service_spec.rb --format documentation`
- **Per wave merge:** `cd source/dashboard && bin/rspec --format documentation`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `spec/requests/api/v1/approvals_spec.rb` -- add batch_approve request specs
- [ ] `spec/services/approval_service_spec.rb` -- add batch_approve service specs

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Ruby 3.3.3, Rails 8, React 19, PostgreSQL 17, Vite, Tailwind CSS v4
- **Testing:** RSpec, Factory Bot, Faker, RuboCop before commits (`bin/rubocop -A .`)
- **App location:** Rails app in `source/dashboard`
- **Serialization:** jbuilder for JSON responses
- **State management:** TanStack Query for server state, Zustand for UI state only
- **Icons:** Font Awesome 6 (free solid set)
- **Styling:** Tailwind CSS v4 with CSS-first config, cn() utility
- **No axios:** Use native fetch + React Query (via existing apiFetch/apiMutate)
- **No active_model_serializers:** jbuilder only
- **UI components:** Reuse existing Card, Badge, Button, Table, Input, StatusDot, Modal

## Sources

### Primary (HIGH confidence)
- Codebase inspection of existing Approval model, service, controller, hooks, types, and components
- `source/dashboard/app/models/approval.rb` -- schema, enums, associations
- `source/dashboard/app/services/approval_service.rb` -- list, find, approve, deny methods
- `source/dashboard/app/controllers/api/v1/approvals_controller.rb` -- existing endpoints
- `source/dashboard/app/frontend/hooks/useApprovals.ts` -- existing React Query hooks
- `source/dashboard/app/frontend/types/api.ts` -- Approval TypeScript interface
- `source/dashboard/app/frontend/stores/filterStore.ts` -- ApprovalFilters already defined
- `source/dashboard/db/seeds.rb` -- seed data with all 3 approval types, varied context JSONB shapes

### Secondary (MEDIUM confidence)
- UI patterns derived from Phase 5 (AgentsPage) and Phase 6 (TasksPage) implementations
- Component patterns from AgentCard, TaskCard, AgentFilters, TaskFilters, TaskListView

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, no new dependencies
- Architecture: HIGH -- follows exact patterns from Phases 5 and 6
- Pitfalls: HIGH -- identified from inspecting existing code and data shapes

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable -- no external dependency changes expected)
