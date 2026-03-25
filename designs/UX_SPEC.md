# OpenClaw Command Center — Project Spec

## 1. Overview

A dashboard application for managing OpenClaw agents, tracking usage, and handling approval workflows. Built with Ruby on Rails (API) + React (frontend). Data is sourced from files in the OpenClaw repo; the dashboard reads, displays, and manages agent state.

### Functional Summary

- View and manage all registered agents and their current task assignments
- Monitor usage metrics (token consumption, API calls, cost, runtime)
- Review and act on pending approvals (tool access, deployments, escalations)
- Real-time status visibility across the agent fleet

### Visual Direction

- **Palette**: Dark-mode primary. Deep navy/charcoal background (`#0f1219`), muted card surfaces (`#1a1f2e`), accent in electric teal (`#00d4aa`) for active states and CTAs. Error/warning in amber (`#f59e0b`) and red (`#ef4444`).
- **Typography**: Monospace for data/metrics (JetBrains Mono or similar). Sans-serif (Inter) for labels and navigation.
- **Layout**: Dense, information-rich. Inspired by Grafana/Datadog — not consumer SaaS. Minimal whitespace. Data-forward.
- **Components**: Compact cards, inline status badges, sparkline charts, collapsible panels. No modals for primary workflows — use inline expansion and slide-over panels instead.
- **Iconography**: Minimal, outlined, 16px default. Use status dots (green/amber/red) over icons where possible.

---

## 2. Sections

### 2.1 Top Navigation Bar

Persistent horizontal bar across all views. Contains:

- OpenClaw logo + "Command Center" wordmark (left)
- Global search input — searches agents, tasks, approvals by keyword (center)
- Notification bell with unread count badge (right)
- User avatar + dropdown for settings (right)

### 2.2 Sidebar Navigation

Vertical sidebar, collapsible to icon-only mode. Links to:

- **Dashboard** (home/overview)
- **Agents** (fleet management)
- **Tasks** (task board)
- **Usage** (metrics & cost)
- **Approvals** (approval queue)
- **Settings** (config)

Active state indicated by teal left-border highlight and teal icon fill.

### 2.3 Dashboard (Home)

The default landing view. A single-page summary with four rows:

- **Row 1 — KPI cards** (4 across): Active agents count, tasks in progress, pending approvals, total tokens used (24h). Each card shows current value + delta from previous period as a small green/red arrow.
- **Row 2 — Agent activity timeline**: Horizontal scrolling timeline showing agent events (started, completed, failed, waiting for approval) over the last 24h. Each event is a dot on the timeline, color-coded by type.
- **Row 3 — Recent tasks table**: Compact table (5 rows) showing most recent tasks. Columns: task name, assigned agent, status badge, duration, timestamp. Clickable rows expand inline to show detail.
- **Row 4 — Approval queue preview**: Shows top 3 pending approvals with agent name, requested action, and time waiting. "View all" link to full approvals section.

### 2.4 Agents

Fleet management view. Two sub-views toggled via tabs:

**Grid view (default)**: Cards laid out in a responsive grid. Each card shows:

- Agent name + identifier
- Status dot (active / idle / error / offline)
- Current task name (or "Idle")
- Uptime duration
- Token usage sparkline (last 7 days)
- Three-dot menu for actions (restart, disable, view logs)

**Table view**: Dense sortable/filterable table with columns: name, status, current task, uptime, tokens (24h), tokens (total), last active, actions.

Clicking an agent opens a **slide-over panel** from the right with:

- Full agent config (read from repo files)
- Task history (list of past assignments with outcomes)
- Usage chart (line chart, tokens over time, selectable range)
- Logs tail (last 50 log lines, auto-scroll)

### 2.5 Tasks

Kanban-style task board with columns:

- **Queued** — tasks waiting for agent assignment
- **In Progress** — currently executing
- **Awaiting Approval** — blocked on human approval
- **Completed** — finished (last 24h)
- **Failed** — errored out (last 24h)

Each task card shows: task title, assigned agent (avatar + name), priority tag (P0–P3), elapsed time, and a truncated description. Cards are draggable between columns for manual override.

Clicking a card expands it inline to show: full description, agent logs for this task, approval chain if applicable, output/artifacts, and retry button for failed tasks.

### 2.6 Usage

Metrics and cost tracking view. Three panels:

**Top — Summary bar**: Total tokens (24h), total API calls (24h), estimated cost (24h), average latency. Same KPI card style as dashboard.

**Middle — Charts** (2-column grid):

- Token usage over time (stacked area chart, one series per agent, selectable time range: 1h / 6h / 24h / 7d / 30d)
- API calls by endpoint (horizontal bar chart)
- Cost breakdown by agent (donut chart)
- Latency distribution (histogram)

**Bottom — Usage table**: Per-agent breakdown. Columns: agent name, tokens in, tokens out, total tokens, API calls, estimated cost, avg latency. Sortable. Exportable to CSV.

### 2.7 Approvals

Queue-based approval management. Split into two tabs:

**Pending**: List of items requiring human action. Each row shows:

- Requesting agent name
- Action requested (tool access, deployment, escalation, budget override)
- Risk level badge (low / medium / high / critical)
- Time waiting
- Context summary (1-2 lines of why the agent is requesting this)
- **Approve** (teal) and **Deny** (red) buttons inline
- **Details** expand link showing full context, agent reasoning, and related task

**History**: Chronological log of past decisions. Columns: timestamp, agent, action, decision (approved/denied), decided by, response time.

### 2.8 Settings

Configuration panel with subsections:

- **General**: Command center display name, timezone, refresh interval
- **Agents**: Default token budgets, auto-restart policies, allowed tools list
- **Notifications**: Alert thresholds (e.g., notify when agent exceeds N tokens), notification channels (in-app, email)
- **Data Sources**: Path to OpenClaw workspace, Gateway connection settings, refresh strategy
- **Queue**: Default queue mode (steer/followup/collect), debounceMs, cap, drop policy
- **Sessions**: dmScope setting, session pruning rules, identity links

