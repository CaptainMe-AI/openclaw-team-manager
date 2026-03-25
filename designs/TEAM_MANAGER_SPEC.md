# Team Manager Spec — OpenClaw Command Center

Feature-level specification extracted from the 7 design screens (`designs/html/` and `designs/png/`). Each section maps UI features to their OpenClaw data sources. For protocol details, wire formats, and filesystem paths see [FUNCTIONAL_SPEC.md](./FUNCTIONAL_SPEC.md).

---

## Global Shell

Persistent across all screens.

### Sidebar Navigation

| Item | Icon | Route | Badge |
|------|------|-------|-------|
| Dashboard | `chart-line` | `/` | — |
| Agents | `robot` | `/agents` | — |
| Tasks | `list-check` | `/tasks` | — |
| Usage | `chart-pie` | `/usage` | — |
| Approvals | `shield-check` | `/approvals` | Live count of pending items |
| Settings | `gear` | `/settings` | — |

Active state: `bg-surfaceHover`, `text-accent`, left border accent.

Sidebar is fixed at `w-64` on desktop, collapsible via hamburger on mobile.

### Top Navigation Bar

| Element | Detail |
|---------|--------|
| Breadcrumb | `Command Center > {Page Name}` |
| Global search | Input with placeholder `"Search agents, tasks, or approvals (Press '/')"`. Keyboard shortcut `/` to focus. Searches across agents, tasks, and approvals simultaneously. |
| Notification bell | Icon with unread dot indicator. Opens notification dropdown. |
| User avatar | Dropdown with account actions. |

**Data source:** Search queries the Command Center's local DB (agents, tasks, approvals tables). No direct OpenClaw RPC for search — CC indexes data from Gateway events and filesystem reads.

---

## 1. Dashboard (Overview)

**Screen:** `3-OpenClaw Command - OpenClaw Da.html` / `screenshot_3.png`

### 1.1 Page Header

- Title: "Overview"
- Subtitle: "Real-time status of your OpenClaw agent fleet."
- Time period selector: dropdown defaulting to "Last 24 Hours"
- "New Task" button (accent, `plus` icon) → opens Create New Task modal

### 1.2 KPI Cards

Four-column grid of stat cards, each with icon, value, trend indicator, and sparkline chart.

| Card | Icon | Sample Value | Trend | Sparkline |
|------|------|-------------|-------|-----------|
| Active Agents | `robot` (blue) | 42 | ↑ 12% (green) | 7-day activity |
| Tasks in Progress | `spinner` (blue) | 18 | ↑ 4 (green) | Task count over time |
| Pending Approvals | `shield-check` (amber, pulsing) | 3 | ↑ 2 (red) | Plus avatar stack "Waiting for review" |
| Tokens Used (24h) | `coins` (purple) | 1.2M | ↑ 18% (red) | Subtext: `Cost: $42.50 | Avg: 50k/hr` |

**Data sources:**

- **Active Agents**: Count of agents with `presence` state `online` or `active`. Source: `system-presence` RPC + `presence` events via Gateway WS. See [FUNCTIONAL_SPEC §3.1](./FUNCTIONAL_SPEC.md#31-gateway-websocket-connection) (event subscriptions).
- **Tasks in Progress**: Count of tasks where the corresponding `agent` lifecycle event is `start` but no `end`/`error` received yet. Source: `agent` events via Gateway WS. See [FUNCTIONAL_SPEC §3.3](./FUNCTIONAL_SPEC.md#33-agent-lifecycle-mapping) (Agent Lifecycle Mapping).
- **Pending Approvals**: Count of tasks in `Awaiting Approval` state — i.e., agent runs where a `tool_start` event with `needsApproval: true` has fired but no `agent.approve` response sent. Source: `agent` events. See [FUNCTIONAL_SPEC §3.5](./FUNCTIONAL_SPEC.md#35-approval-workflows) (Approval Workflows).
- **Tokens Used**: Parsed from session JSONL files at `~/.openclaw/agents/<agentId>/sessions/*.jsonl`. Each assistant turn contains `usage` metadata with `input_tokens` and `output_tokens`. CC aggregates across all agents for the selected time window. See [FUNCTIONAL_SPEC §3.2](./FUNCTIONAL_SPEC.md#32-filesystem-data-sources) (Filesystem Data Sources).
- **Cost**: Calculated by CC from token counts × per-model pricing stored in CC config (Opus rate, Sonnet rate).
- **Sparklines**: Rendered client-side from time-bucketed historical data stored in CC's local DB.

### 1.3 Agent Activity Timeline

Horizontal timeline spanning 00:00 → Now for the selected time period. Event dots color-coded by outcome:

| Color | Meaning |
|-------|---------|
| Green | Completed |
| Blue | Started |
| Amber | Waiting (approval) |
| Red | Failed |

Interactive: hover reveals tooltip with agent name, task title, timestamp.

**Data source:** `agent` lifecycle events (`start`, `end`, `error`, `tool_start` with `needsApproval`) received via Gateway WS, stored in CC's local DB as an activity log. See [FUNCTIONAL_SPEC §3.3](./FUNCTIONAL_SPEC.md#33-agent-lifecycle-mapping).

### 1.4 Recent Tasks Table

| Column | Content |
|--------|---------|
| Task Name | Title from the task prompt |
| Assigned Agent | Agent name with colored badge and `robot` icon |
| Status | Badge: In Progress (blue, pulsing dot), Completed (green), Waiting Approval (amber), Failed (red) |
| Duration | Elapsed time from `start` event to `end`/`error` event. `--` if still running or awaiting approval. |
| Timestamp | Relative time (e.g., "Just now", "2h ago") |

Rows are expandable (chevron icon). "View All" link navigates to `/tasks`.

**Data source:** Same as [§1.2](#12-kpi-cards)/[§1.3](#13-agent-activity-timeline) — `agent` events mapped to CC task model per [FUNCTIONAL_SPEC §3.3](./FUNCTIONAL_SPEC.md#33-agent-lifecycle-mapping).

### 1.5 Action Required Sidebar

Right-side panel showing items needing immediate attention:

- Approval items with priority badge, agent name, and description
- Quick-action buttons (Approve/Deny) inline

**Data source:** Subset of pending approvals, sorted by priority and wait time. Same source as [Approvals screen (§5)](#5-approvals).

---

## 2. Agent Fleet

**Screen:** `4-OpenClaw Command - Agents Over.html` / `screenshot_4.png`

### 2.1 Page Header

- Title: "Agent Fleet"
- Subtitle: "Manage, monitor, and configure all registered OpenClaw agents."
- View toggle: Grid (default) / Table
- Filters bar: Status (All / Active / Idle / Disabled), Model (All / Opus / Sonnet), Uptime threshold (> 24h), Clear button
- Time period filter: Last 24 Hours / 7 Days / 30 Days

### 2.2 Agent Cards (Grid View)

Each agent is a card with:

| Element | Detail |
|---------|--------|
| Icon | Rounded colored background with `robot` icon |
| Name | e.g., "Agent-Alpha" (hoverable, accent on hover) |
| Agent ID | Monospace, e.g., `id: agt_001x` |
| Status badge | Active (green), Idle (gray), Disabled (red with lowered opacity) |
| Current Task | Truncated task name or "(None)" if idle |
| Uptime | Monospace, e.g., `4d 12h 30m` |
| Token Usage (7d) | Monospace value + sparkline chart |
| Context menu | Three-dot menu → Restart, View Logs, Disable (danger) |

Cards with `Disabled` status render at reduced opacity. Cards with errors show a red border highlight.

### 2.3 Agent Table (Table View)

Same data as cards but in tabular layout. Columns: Name, ID, Status, Model, Current Task, Uptime, Tokens (7d).

**Data sources:**

- **Agent list and config**: Parsed from `~/.openclaw/openclaw.json` → `agents.list[]`. Each entry has `id`, `name`, `workspace`, `model`. See [FUNCTIONAL_SPEC §3.2](./FUNCTIONAL_SPEC.md#32-filesystem-data-sources).
- **Agent identity (name, emoji)**: Read from each agent's `IDENTITY.md` at `<workspace>/IDENTITY.md`. See [FUNCTIONAL_SPEC §3.2](./FUNCTIONAL_SPEC.md#32-filesystem-data-sources) (Workspace table).
- **Status (Active/Idle/Disabled)**: `presence` events via Gateway WS. `system-presence` RPC for initial state on page load. See [FUNCTIONAL_SPEC §3.1](./FUNCTIONAL_SPEC.md#31-gateway-websocket-connection).
- **Current Task**: Latest `agent` lifecycle event with `lifecycle: "start"` and no corresponding `end`/`error`. Source: `agent` events.
- **Uptime**: Tracked by CC from `presence` events — time since last `online` event without a subsequent `offline`.
- **Token Usage (7d)**: Aggregated from session JSONL files per agent. See [§1.2 KPI Cards](#12-kpi-cards).
- **Model**: From `agents.list[].model` in `openclaw.json`.
- **Restart action**: Sends a signal to the Gateway to restart the agent process (implementation-specific).
- **View Logs action**: Navigates to parsed session JSONL for that agent.
- **Disable action**: Updates agent config via CC API (toggles enabled state).

---

## 3. Task Board

**Screen:** `5-OpenClaw Command - Task Manage.html` / `screenshot_5.png`

### 3.1 Page Header

- Title: "Task Board"
- Subtitle: "Monitor and manage agent workflows across all stages."
- View toggle: Board (default) / List
- "New Task" button (accent, `plus` icon) → opens Create New Task modal
- Filters bar: Agent (All), Priority (All), Time (Last 24h)
- Priority legend: P0 (red), P1 (amber), P2 (blue), P3 (gray)

### 3.2 Kanban Columns

Horizontally scrollable board with columns representing task states:

| Column | Maps to OpenClaw State | Description |
|--------|----------------------|-------------|
| BACKLOG | Task created in CC, not yet sent to Gateway | User-created tasks waiting to be dispatched. No `agent` RPC sent yet. |
| QUEUED | `agent` RPC sent, `{runId, acceptedAt}` returned, waiting in queue lane | Task accepted by Gateway, sitting in the per-session-key queue lane waiting for concurrency slot. See [FUNCTIONAL_SPEC §3.4](./FUNCTIONAL_SPEC.md#34-queue--concurrency-visibility) (Queue & Concurrency Visibility). |
| IN PROGRESS | `agent` lifecycle event `start` received | Agent is actively executing. Tool calls show as sub-events. |
| AWAITING APPROVAL | `tool_start` event with `needsApproval: true` | Agent run paused, waiting for human decision. Links to Approvals screen. |
| COMPLETED | `agent` lifecycle event `end` received | Agent run finished successfully. |
| FAILED | `agent` lifecycle event `error` received | Agent run errored or timed out. |

See [FUNCTIONAL_SPEC §3.3](./FUNCTIONAL_SPEC.md#33-agent-lifecycle-mapping) (Agent Lifecycle Mapping) for the full state mapping table.

### 3.3 Task Cards

Each card in a column shows:

| Element | Detail |
|---------|--------|
| Left border | Color-coded by priority (P0=red, P1=amber, P2=blue, P3=gray) |
| Task ID | Monospace, e.g., `tsk_1050` (CC-generated) |
| Priority badge | `P0`–`P3` with background color |
| Title | Task name from creation form |
| Description | 2-line clamped excerpt |
| Assigned agent | Agent name with `robot` icon, or "Unassigned" with `user-xmark` icon |
| Timestamp | Relative time since creation, monospace |

Cards are draggable between columns (manual state override). Clicking a card opens a detail panel with full session transcript.

**Data sources:**

- **Task metadata (title, description, priority, agent assignment)**: Stored in CC's local DB. Created via the New Task form.
- **Task state**: Derived from Gateway `agent` lifecycle events mapped per [FUNCTIONAL_SPEC §3.3](./FUNCTIONAL_SPEC.md#33-agent-lifecycle-mapping). CC listens to `agent` events on the WS connection and updates task state in real-time.
- **Queue position**: For QUEUED tasks, the queue lane and position can be inferred from `agent` event timing. See [FUNCTIONAL_SPEC §3.4](./FUNCTIONAL_SPEC.md#34-queue--concurrency-visibility).
- **Session transcript (on card click)**: Read from `~/.openclaw/agents/<agentId>/sessions/<sessionId>.jsonl`. See [FUNCTIONAL_SPEC §3.2](./FUNCTIONAL_SPEC.md#32-filesystem-data-sources).
- **Run ID linkage**: The `runId` returned from the `agent` RPC call is stored with the task and used to correlate incoming `agent` events.

---

## 4. Create New Task

**Screen:** `6-OpenClaw - New Task.html` / `screenshot_6.png`

Modal dialog overlaying the current screen.

### 4.1 Form Fields

| Field | Type | Placeholder / Options | Required |
|-------|------|----------------------|----------|
| Task Name | Text input | `"e.g., Scrape competitor pricing data"` | Yes |
| Assign Agent | Dropdown | `"Select an agent..."` → lists all registered agents (Paul, Mark, Dennis) | Yes |
| Description | Textarea | `"Provide detailed instructions for the agent."` | Yes |
| Attachments | File upload | `"Drag files, context, requirements, or special instructions"` | No |
| Priority Level | Button group | `—` (none) / Low / `Medium` (default, highlighted) / High | Yes |

### 4.2 Actions

- "Cancel" button (transparent) — closes modal, discards form
- "Create Task" button (accent) — validates form, creates task

### 4.3 Task Creation Flow

When the user clicks "Create Task":

1. CC validates form fields and stores the task in its local DB with status `BACKLOG`.
2. If the user selected an agent, CC constructs the prompt using the template from [FUNCTIONAL_SPEC §3.7](./FUNCTIONAL_SPEC.md#37-multi-product-context-on-demand-loading): `"Agent: {{agent.name}}. Read your role definition from roles/{{agent.role}}/ROLE.md. Product: {{product.name}}. Read the relevant context from products/{{product.id}}/ before proceeding. Task: {{task.description}}"`.
3. CC sends the `agent` RPC to the Gateway: `{method: "agent", params: {sessionKey: "{{agent.id}}-{{product.id}}", prompt: "..."}}`.
4. Gateway returns `{runId, acceptedAt}`. CC stores the `runId` against the task and moves it to `QUEUED`.
5. When the Gateway dequeues and starts the run, CC receives `agent` lifecycle event with `lifecycle: "start"` and moves the task to `IN PROGRESS`.

See [FUNCTIONAL_SPEC §3.1](./FUNCTIONAL_SPEC.md#31-gateway-websocket-connection) (Gateway RPC methods) and [§3.3](./FUNCTIONAL_SPEC.md#33-agent-lifecycle-mapping) (Agent Lifecycle Mapping).

**Data sources for dropdowns:**

- **Agent list**: Parsed from `openclaw.json` → `agents.list[]`. See [FUNCTIONAL_SPEC §3.2](./FUNCTIONAL_SPEC.md#32-filesystem-data-sources).
- **Product list** (if product selector is added): Read from `~/.openclaw/shared/products/` directory listing. See [FUNCTIONAL_SPEC §3.7](./FUNCTIONAL_SPEC.md#37-multi-product-context-on-demand-loading).

---

## 5. Approvals

**Screen:** `1-OpenClaw Command - Approvals D.html` / `screenshot_1.png`

### 5.1 Page Header

- Title: "Approvals"
- Subtitle: "Manage pending requests and review historical decisions."
- "Approve All" button (accent, `check-double` icon) — batch-approves all pending items

### 5.2 Tabs

| Tab | Content |
|-----|---------|
| Pending (active) | Live list of items awaiting approval, with badge showing count |
| History | Table of past approval decisions |

### 5.3 Filters & Sort

- Risk Level filter dropdown: All Risk Levels / Critical / High / Medium / Low
- Sort by: "Time Waiting" (clickable to toggle sort direction)

### 5.4 Pending Approval Cards

Each pending approval is an expandable card:

| Element | Detail |
|---------|--------|
| Priority badge | Critical (red), High (amber), Medium (blue), Low (gray) |
| Title | Approval type, e.g., "Production Deployment", "Budget Override", "Tool Access Request" |
| Time waiting | Clock icon + elapsed time, e.g., `14m waiting`, `2h 45m waiting` |
| Agent | Robot icon + agent name, e.g., "Agent-Deployer" |
| Target | Monospace bordered label, e.g., `auth-service-v2`, `API Cost Limit`, `AWS S3 Read Access` |
| Description | 1–2 sentence summary of what the agent is requesting |
| Details toggle | Chevron button to expand/collapse |
| Deny button | Red outline, danger styling |
| Approve button | Accent green |

### 5.5 Expanded Details

When expanded, a two-column panel appears:

| Left Panel: Agent Reasoning | Right Panel: Related Context |
|-----------------------------|------------------------------|
| Monospace code-like block showing the agent's internal reasoning for the request. E.g., risk analysis for deployments, spend breakdown for budget overrides, error context for tool access. | Linked artifacts: commit hashes (`code-commit` icon), related task links (`list-check` icon). |

### 5.6 Approval Types

The designs show three distinct approval categories, all unified in one queue:

| Type | Trigger | OpenClaw Mechanism |
|------|---------|-------------------|
| **Production Deployment** | Agent calls a deploy tool | `beforeToolCall` plugin hook fires with `needsApproval: true`. Gateway sends `agent` event with `lifecycle: "tool_start"`. See [FUNCTIONAL_SPEC §3.5](./FUNCTIONAL_SPEC.md#35-approval-workflows). |
| **Budget Override** | Agent approaches token budget limit | CC monitors cumulative token usage from session JSONL. When spend hits threshold (e.g., 90%), CC creates an approval item. Budget config stored in CC settings. |
| **Tool Access Request** | Agent calls a tool requiring elevated permissions | Same as deployment — `beforeToolCall` hook with `needsApproval: true`. The target field shows the specific resource being accessed. |

### 5.7 Approval Actions

- **Approve**: CC sends `{method: "agent.approve", params: {runId, decision: "approved"}}` to the Gateway via WS. The agent run resumes tool execution. See [FUNCTIONAL_SPEC §3.5](./FUNCTIONAL_SPEC.md#35-approval-workflows).
- **Deny**: CC sends `{method: "agent.approve", params: {runId, decision: "denied"}}`. The agent run receives a denial and handles gracefully (retry logic or error).
- **Approve All**: Batch operation — iterates over all pending items and sends individual approve RPCs.

### 5.8 History Table

| Column | Content |
|--------|---------|
| Timestamp | ISO datetime of decision |
| Agent | Agent name |
| Action | What was approved/denied (e.g., "Schema Migration") |
| Decision | Badge: Approved (green) or Denied (red) |
| Decided By | Email/username of the person who made the decision |

**Data source:** CC's local DB stores all approval decisions with timestamps. Historical data is never deleted.

---

## 6. Usage & Cost Tracking

**Screen:** `7-OpenClaw Command - Usage Overv.html` / `screenshot_7.png`

### 6.1 Page Header

- Title: "Usage & Cost Tracking"
- Subtitle: "Monitor API consumption, latency, and estimated costs across your agent fleet."
- Time period selector: button group `1h | 6h | 24h (active) | 7d | 30d`
- "Export Report" button (`download` icon)

### 6.2 KPI Cards

Four-column grid:

| Card | Icon | Sample Value | Trend |
|------|------|-------------|-------|
| Total Tokens | `coins` (chart1) | 42.8M / 24h | ↑ 12.5% (green) |
| Total API Calls | `network-wired` (chart2) | 124.5k / 24h | ↑ 5.2% (green) |
| Estimated Cost | `dollar-sign` (chart5) | $842.50 / 24h | ↑ 18.1% (red) |
| Avg Latency | `stopwatch` (chart3) | 1.8s avg | ↓ 1.2s (green) |

Trend indicators: green = improvement (↑ for throughput metrics, ↓ for latency), red = degradation.

### 6.3 Charts

Two-column grid of interactive charts:

| Chart | Type | Description |
|-------|------|-------------|
| Token Usage Over Time | Stacked area chart | Token consumption broken down by agent (Paul, Mark, Dennis) over the selected time window. Stacked areas show each agent's contribution. |
| Cost Breakdown by Agent | Donut/pie chart | Proportional cost per agent. Segments color-coded per agent. |
| API Calls by Endpoint | Horizontal bar chart | Top API endpoints by call volume. Bars color-coded by agent. |
| Latency Distribution | Histogram | Distribution of response latencies across all agent runs. Buckets by latency range. |

Each chart has a three-dot menu for additional options (export, fullscreen, etc.).

### 6.4 Export Report

Generates a downloadable report (CSV or PDF) of usage data for the selected time period.

**Data sources:**

- **Token counts**: Parsed from session JSONL files at `~/.openclaw/agents/<agentId>/sessions/*.jsonl`. Each assistant message includes `usage: {input_tokens, output_tokens}`. CC aggregates these per agent, per time bucket. See [FUNCTIONAL_SPEC §3.2](./FUNCTIONAL_SPEC.md#32-filesystem-data-sources).
- **API calls**: Counted from the number of `agent` RPC requests CC has sent to the Gateway, plus tool call events (`tool_start`/`tool_end` pairs) from the `agent` event stream. See [FUNCTIONAL_SPEC §3.1](./FUNCTIONAL_SPEC.md#31-gateway-websocket-connection).
- **Estimated cost**: CC multiplies token counts by per-model pricing: Opus rate × (Paul + Dennis tokens) + Sonnet rate × (Mark tokens). Pricing stored in CC's Settings → General.
- **Latency**: Measured as the time delta between `agent` RPC response (`acceptedAt`) and the first `agent` event with `lifecycle: "start"` (queue latency), plus the delta between `start` and `end` events (execution latency). Derived from Gateway event timestamps.
- **Time-series data**: CC stores historical snapshots in its local DB (PostgreSQL) for chart rendering. Raw data is always re-derivable from session JSONL files.

---

## 7. Settings

**Screen:** `2-OpenClaw Command - Settings Ov.html` / `screenshot_2.png`

### 7.1 Page Header

- Title: "Configuration Settings"
- Subtitle: "Manage global preferences, agent policies, and data integrations."
- "Discard Changes" button (surface styling)
- "Save Configuration" button (accent, `save` icon)

### 7.2 Settings Tabs (Left Sidebar)

| Tab | Icon | Content |
|-----|------|---------|
| General | `gear` | Display name, timezone, refresh rate |
| Agents | `robot` | Agent policies, defaults, budget limits |
| Notifications | `bell` | Alert thresholds, notification channels |
| Data Sources | `database` | Integration configuration |

### 7.3 General Preferences

| Field | Type | Default Value | Helper Text |
|-------|------|--------------|-------------|
| Display Name | Text input | `"OpenClaw Production"` | "The name shown in the top navigation and emails." |
| Timezone | Dropdown | `America/New_York (EST)` | "Default timezone for all metrics and logs." Options: UTC, America/New_York, America/Los_Angeles, Europe/London |
| Dashboard Refresh | Dropdown | `30 seconds` | "How often the UI polls for new data." Options: Manual, 10s, 30s, 1min, 5min. Warning: "Frequent polling may increase API costs." |

**Data source:** These are CC-only settings stored in its local DB. The timezone setting is also used when rendering timestamps from session JSONL data.

### 7.4 Agent Policies

| Field | Type | Description |
|-------|------|-------------|
| Default Budget | Number input (currency) | Default daily token budget per agent. Sample value: `$100`. CC monitors spend against this threshold and creates approval items when approached. |
| Auto-Restart | Toggle + dropdown | Whether to automatically restart failed agents. Toggle on/off, plus restart condition. Sample: `Automatically restart on crash`. |
| Global Allowed Tools | Multi-select chips | Default tool allowlist applied to all agents. Sample: `Filesystem`, `Network`, `Database`. Chips are selectable/deselectable. |

**Data sources:**

- **Default Budget**: CC-only setting. CC calculates spend from session JSONL token counts (see [§6.4 Export Report](#64-export-report)) and compares against this threshold.
- **Auto-Restart**: CC-only setting. When an `agent` event with `lifecycle: "error"` is received, CC can automatically re-send the `agent` RPC if this is enabled.
- **Global Allowed Tools**: Read from and written to `openclaw.json` → agent tool configuration. See [FUNCTIONAL_SPEC §3.2](./FUNCTIONAL_SPEC.md#32-filesystem-data-sources) (Config section). Alternatively, this is set per-agent via sandbox config — see [FUNCTIONAL_SPEC §3.5](./FUNCTIONAL_SPEC.md#35-approval-workflows) and [AGENT_SETUP_GUIDE Step 8](./AGENT_SETUP_GUIDE.md#step-8-configure-per-agent-sandbox-and-tool-restrictions-optional).

### 7.5 Notifications Tab

Alert threshold configuration for:
- Budget alerts (percentage of daily limit)
- Task failure alerts
- Approval timeout alerts
- Agent offline alerts

CC-only settings. Notification delivery channels (email, Slack webhook, etc.) are configurable here.

### 7.6 Data Sources Tab

Integration configuration for connecting CC to the OpenClaw filesystem and Gateway:

| Field | Description |
|-------|-------------|
| Gateway WebSocket URL | Default `ws://127.0.0.1:18789`. See [FUNCTIONAL_SPEC §3.1](./FUNCTIONAL_SPEC.md#31-gateway-websocket-connection). |
| Gateway Auth Token | Token value for `params.auth.token` in the WS handshake. Reads from `OPENCLAW_GATEWAY_TOKEN` env var by default. |
| OpenClaw Home Directory | Default `~/.openclaw`. Base path for all filesystem reads (config, workspaces, sessions). |
| Session JSONL Path | Default `~/.openclaw/agents/`. Override if agents are on a remote filesystem. |
| Refresh interval | How often CC re-scans the filesystem for new session data. |

---

## Design System Reference

Extracted from the HTML/CSS across all screens.

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0f1219` | Page background |
| `surface` | `#1a1f2e` | Cards, panels, sidebar |
| `surfaceHover` | `#252b3d` | Hover states, active filters |
| `accent` | `#00d4aa` | CTA buttons, active nav, links |
| `accentHover` | `#00b38f` | Button hover state |
| `textPrimary` | `#f3f4f6` | Headings, body text |
| `textSecondary` | `#9ca3af` | Subtitles, helper text, timestamps |
| `border` | `#2d3748` | Card borders, dividers |
| `danger` | `#ef4444` | Deny buttons, failed states, P0 |
| `warning` | `#f59e0b` | Amber alerts, P1 |
| `success` | `#10b981` | Approve buttons, completed states |

### Priority Colors

| Level | Color | Hex |
|-------|-------|-----|
| P0 / Critical | Red | `#ef4444` |
| P1 / High | Amber | `#f59e0b` |
| P2 / Medium | Blue | `#3b82f6` |
| P3 / Low | Gray | `#9ca3af` |

### Typography

| Use | Font | Weight |
|-----|------|--------|
| UI text, labels, body | Inter | 300–700 |
| Data values, IDs, code blocks | JetBrains Mono | 400–700 |

### Component Patterns

| Component | Styling |
|-----------|---------|
| Cards | `bg-surface`, `border border-border`, `rounded-lg`, `card-glow` shadow |
| Buttons (primary) | `bg-accent`, `text-background`, `hover:bg-accentHover`, `px-3 py-1.5`, `rounded-md` |
| Buttons (secondary) | `bg-surface`, `border border-border`, `text-textPrimary` |
| Buttons (danger) | `bg-transparent`, `border border-danger`, `text-danger` |
| Badges | `px-2 py-0.5`, `rounded`, `text-xs`, `font-medium` |
| Tables | Header: `bg-surfaceHover/50`, `text-xs`, `uppercase`. Rows: `divide-y divide-border`, `hover:bg-surfaceHover/30` |
| Inputs | `bg-background`, `border border-border`, `focus:border-accent`, `focus:ring-1 ring-accent` |
| Status dots | `w-1.5 h-1.5`, `rounded-full`, color-coded |

### Icons

Font Awesome 6.4.0 (`fa-solid` weight). Key icons: `robot`, `chart-line`, `list-check`, `chart-pie`, `shield-check`, `gear`, `coins`, `spinner`, `stopwatch`, `network-wired`, `dollar-sign`, `code-commit`, `ellipsis-vertical`, `chevron-down`, `plus`, `download`, `search`, `bell`, `user-xmark`, `clock`.

### Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | Single column, sidebar collapses to hamburger menu, touch-friendly buttons |
| Tablet (640–1024px) | 2-column grids, sticky sidebar |
| Desktop (> 1024px) | Full sidebar, 3–4 column grids, expanded detail panels |
