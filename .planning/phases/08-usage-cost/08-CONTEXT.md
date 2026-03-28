# Phase 8: Usage & Cost - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Operators can monitor token usage, API costs, and latency across their agent fleet. KPI summary cards with trend indicators, 4 chart types (stacked area, donut, horizontal bar, histogram), time period selector, and export capability. Replaces the UsagePage placeholder.

</domain>

<decisions>
## Implementation Decisions

### Data Gaps — Backend Additions
- **D-01:** Add `latency_ms` integer column to UsageRecord via migration — seed data generates realistic latency values (50-500ms range, varying by agent). Required for USAG-01 (avg latency KPI) and USAG-05 (latency histogram).
- **D-02:** Add `endpoint` string column to UsageRecord via migration — seed data uses realistic API endpoint paths (e.g., "/v1/chat/completions", "/v1/embeddings", "/v1/models"). Required for USAG-04 (API calls by endpoint bar chart).
- **D-03:** Extend UsageService with aggregation methods for chart data: `by_agent_over_time`, `cost_by_agent`, `calls_by_endpoint`, `latency_distribution`. SQL GROUP BY per Phase 4 D-14.
- **D-04:** Add new API endpoint(s) or extend existing `/api/v1/usage` to serve aggregated chart data — avoid sending raw records to the frontend for aggregation.

### Chart Layout
- **D-05:** KPI cards row at top (4 cards), then 2x2 grid for charts below. Stacked area (token usage) and donut (cost breakdown) on top row, horizontal bar (API calls) and histogram (latency) on bottom row. Full-width on mobile, 2-column on desktop.

### KPI Trend Indicators
- **D-06:** Percentage change vs previous period with directional arrow (up/down) and color coding (green for cost decrease, red for increase; green for throughput increase). Consistent with dashboard KPI patterns planned for Phase 9.

### Export
- **D-07:** Client-side CSV export using native browser APIs (no additional library). Export current time range data as CSV download. PDF deferred to future enhancement — CSV covers the core need.

### Claude's Discretion
- Exact Recharts configuration (colors, tooltips, legends, responsive breakpoints)
- Chart animation and interaction patterns
- Loading skeleton design for charts
- Error and empty state handling per chart
- UsageService internal query optimization
- useUsage hook extensions vs new hooks for aggregated data

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design and specs
- `designs/TEAM_MANAGER_SPEC.md` — Full UI specification with Usage & Cost screen layout, chart types, data mappings
- `designs/UX_SPEC.md` — Overall layout and interaction patterns

### Existing data layer
- `source/dashboard/app/models/usage_record.rb` — Current schema (needs latency_ms and endpoint columns)
- `source/dashboard/app/services/usage_service.rb` — Current service (list + summary methods, needs chart aggregation methods)
- `source/dashboard/app/controllers/api/v1/usage_controller.rb` — Current controller (index only)
- `source/dashboard/app/frontend/hooks/useUsage.ts` — Current hook (basic fetch with from/to/granularity params)
- `source/dashboard/app/frontend/types/api.ts` — UsageRecord TypeScript interface (needs latency_ms and endpoint)
- `source/dashboard/app/frontend/stores/filterStore.ts` — usageTimeRange already defined (1h/6h/24h/7d/30d)

### Component patterns
- `source/dashboard/app/frontend/components/ui/Sparkline.tsx` — Existing Recharts usage pattern
- `source/dashboard/app/frontend/components/agents/AgentFilters.tsx` — Button group filter pattern to replicate for time period selector
- `source/dashboard/app/frontend/components/pages/AgentsPage.tsx` — Page composition pattern (loading/error/empty states)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Sparkline` component: Recharts AreaChart pattern, can inform larger chart component design
- `Badge`, `Card`, `Button`, `Table` from design system: KPI cards use Card, time selector uses Button group
- `filterStore.usageTimeRange`: Already typed as `"1h" | "6h" | "24h" | "7d" | "30d"` with getter/setter
- `useUsage` hook: Already supports from/to/agent_id/granularity params via TanStack Query
- `UsageService.summary`: Returns total_tokens, total_api_calls, total_cost_cents (avg_latency_ms is nil — needs latency_ms column)
- `apiFetch` / `apiMutate`: Standard API utilities

### Established Patterns
- Page composition: h1 title + subtitle + content area (AgentsPage, TasksPage, ApprovalsPage)
- Filter bar: Button group with variant="primary" active / variant="secondary" inactive, aria-pressed
- Loading: Inline skeleton components with animate-pulse
- Error: faExclamationTriangle + message + Retry button
- Empty: Contextual icon + message
- Mutations: TanStack Query useMutation with toast feedback (Sonner)
- State: Zustand for UI state (filters, toggles), TanStack Query for server state

### Integration Points
- `router.tsx`: UsagePage already routed at `/usage`
- `filterStore`: usageTimeRange state ready to use
- `UsagePage.tsx`: Placeholder to replace (same pattern as Phase 5/6/7)
- Recharts: Installed as dependency, only Sparkline used so far — first major chart usage

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User declined to discuss gray areas, deferring all implementation choices to Claude's discretion within the requirements.

</specifics>

<deferred>
## Deferred Ideas

- PDF export — defer to future enhancement, CSV covers core USAG-07 need
- Real-time chart updates via ActionCable — future phase when Gateway integration happens

</deferred>

---

*Phase: 08-usage-cost*
*Context gathered: 2026-03-27*
