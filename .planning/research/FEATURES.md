# Feature Research

**Domain:** AI Agent Management Dashboard (local mission control)
**Researched:** 2026-03-25
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. Derived from analyzing CrewAI, AutoGen Studio, LangSmith, Datadog LLM Observability, Langfuse, AgentOps, and the broader AI agent management ecosystem.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Agent status overview** | 89% of orgs using agents have some observability. Operators need to know what is running right now. Every competitor shows this. | LOW | Grid/table of agents with online/idle/error status. Already in spec as Agent Fleet screen. |
| **Real-time status updates** | Stale data in agent dashboards is useless. Datadog, Grafana, and every ops tool users compare against streams live. | MEDIUM | WebSocket connection to Gateway for presence events. Mock first, wire later. |
| **Task lifecycle visibility** | Knowing what agents are *doing* is the core value prop. CrewAI, AutoGen Studio, and AgentOps all show task/workflow state. | MEDIUM | Kanban board with Backlog/Queued/In Progress/Awaiting Approval/Completed/Failed. Already in spec. |
| **Token usage tracking** | Every LLM tool tracks tokens (LangSmith, Langfuse, AgentOps, Helicone). Cost is the #1 operational concern. | MEDIUM | Parse session JSONL files, aggregate per agent and time window. Already in spec. |
| **Cost estimation** | Directly tied to token tracking. LangSmith, Langfuse, and AgentOps all compute cost from tokens x model pricing. | LOW | Multiply token counts by configurable per-model rates. Already in spec. |
| **Approval workflow (human-in-the-loop)** | Increasingly standard for production agents. AWS Bedrock, n8n, Permit.io, and LangGraph all support it. Critical for agent trust. | HIGH | Pending queue, approve/deny actions, agent reasoning display, history log. Already in spec. Core differentiator for OpenClaw. |
| **Dashboard overview with KPIs** | Every monitoring tool opens with a summary view. Grafana, Datadog, CrewAI -- they all have a "home" with key numbers. | MEDIUM | Active agents, tasks in progress, pending approvals, token usage. Already in spec. |
| **Dark mode** | Operators monitor for hours. Grafana and Datadog both have dark mode as primary. The spec mandates this. | LOW | Already the design direction. Dark-first, not an afterthought toggle. |
| **Authentication** | Any dashboard holding operational data needs auth. Basic but non-negotiable. | LOW | Devise with console-created users. No signup flow needed for local tool. |
| **Search** | Operators need to find specific agents, tasks, or approvals quickly. Every SaaS dashboard has global search. | MEDIUM | Search across agents, tasks, approvals. Already in spec with keyboard shortcut (`/`). |
| **Filtering and sorting** | Standard data navigation. Users will filter by status, priority, agent, time range. | LOW | Already in spec across Agent Fleet, Task Board, Approvals, and Usage screens. |
| **Time range selection** | All monitoring tools let you scope data to a time window (1h, 6h, 24h, 7d, 30d). | LOW | Already in spec. Affects KPIs, charts, and tables. |
| **Error/failure visibility** | Failed tasks need to be obvious. Datadog highlights errors. AgentOps detects infinite loops. | LOW | Failed column in Kanban, red badges, error states in agent cards. Already in spec. |
| **Settings/configuration** | Operators need to configure budgets, refresh rates, data source paths. | MEDIUM | Settings screen with General, Agents, Notifications, Data Sources tabs. Already in spec. |

### Differentiators (Competitive Advantage)

Features that set OpenClaw Command Center apart from generic observability tools. These are where the product competes -- not by doing everything, but by doing the *local agent operator* workflow better than anyone.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Unified approval queue with agent reasoning** | Most observability tools (LangSmith, Datadog, Langfuse) trace but don't *act*. OpenClaw shows the agent's reasoning for why it needs approval and lets operators approve/deny inline. This is rare -- most tools treat HITL as the framework's problem. | HIGH | The expanded detail view with agent reasoning + related context is the killer feature. No competitor except n8n and Permit.io come close, and those are workflow tools, not dashboards. |
| **Local-first architecture** | LangSmith, Datadog, AgentOps are all cloud SaaS. Langfuse can self-host but requires Postgres + Clickhouse + Redis + S3. OpenClaw CC runs on the same machine with just Postgres. Zero data leaves the operator's machine. | LOW | This is an architecture decision, not a feature to build. But it profoundly shapes the value prop for privacy-conscious operators. |
| **Task creation and dispatch** | Most observability tools are read-only -- they watch but don't *command*. OpenClaw CC can create tasks and dispatch them to agents via the Gateway. This makes it a control plane, not just a monitoring pane. | MEDIUM | New Task modal dispatches `agent` RPC to Gateway. Bridges the gap between "see what happened" and "make something happen." |
| **Queue and concurrency visibility** | Most tools don't show why an agent is waiting. OpenClaw CC maps Gateway queue lanes and shows position, session key grouping, and concurrency slots. | MEDIUM | Unique to OpenClaw's Gateway architecture. QUEUED column in Kanban shows queue position. |
| **Agent activity timeline** | A horizontal event timeline (inspired by Grafana) that shows all agent events over a time range. More visual than a log, more temporal than a table. | MEDIUM | Not common in agent tools. Most show traces as trees/waterfalls. The timeline view is a Grafana-inspired differentiator for fleet-level awareness. |
| **Budget thresholds with approval escalation** | CC monitors cumulative token spend and auto-creates approval items when an agent approaches its budget limit. This is proactive cost control, not just reporting. | MEDIUM | Connects cost tracking to the approval workflow. Most tools just alert; OpenClaw can actually *pause* the agent. |
| **Drag-and-drop task state override** | Kanban cards are draggable for manual state override. Operators can force-move tasks between columns. This operational escape hatch is missing from most agent platforms. | LOW | Standard Kanban DnD pattern but unusual in agent tooling which tends to be purely event-driven. |
| **Data-dense Grafana/Datadog-inspired UI** | Purpose-built for operators who want information density, not consumer SaaS aesthetics. Monospace data, sparklines, compact cards, inline expansion. | MEDIUM | The UX spec explicitly calls this out. Most AI agent dashboards (CrewAI, AutoGen Studio) have consumer-style UIs. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Explicitly deciding NOT to build these prevents scope creep.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time everything via WebSocket** | Live data feels modern and responsive. | Premature WebSocket integration when Gateway is not built yet. Adds complexity to every screen. Polling at 10-30s intervals is sufficient for most ops dashboards (Grafana defaults to 30s). | Start with polling/mock data. Add WebSocket for approval notifications and presence only. The spec already plans mock-first. |
| **Session transcript replay** | AgentOps has "time-travel" replay. Sounds impressive. | JSONL parsing, rendering a conversational UI, handling tool calls inline -- this is a massive feature that's essentially building a chat viewer. High complexity, low initial ROI. | Show session data as expandable raw log (monospace, JSONL viewer) in task detail. Full replay is v2+. |
| **LLM evaluation/scoring** | LangSmith and Braintrust do this. Seems like table stakes. | Evaluation requires defining scoring criteria, building judge pipelines, and interpreting results. It's a separate product category (evals), not a dashboard feature. | Defer entirely. OpenClaw CC is a control plane, not an eval platform. Operators can use LangSmith/Langfuse for evals separately. |
| **Prompt management/versioning** | Langfuse and LangSmith offer this. | OpenClaw agents read their prompts from IDENTITY.md and ROLE.md files in the workspace. Adding a prompt editor creates a competing source of truth. | Respect the filesystem as the source of truth. Show prompt/identity info read-only from workspace files. |
| **Multi-tenancy** | Enterprise feature. Multiple teams sharing one dashboard. | Single operator, local installation. Multi-tenancy adds auth complexity (RBAC, scoping, data isolation) with zero benefit for the target user. | Out of scope per PROJECT.md. Single user, local machine. |
| **Mobile-native app** | Access from phone. | The data-dense Grafana-inspired UI is fundamentally a desktop experience. Mobile would require a completely different information architecture. | Responsive web layout with mobile breakpoints is sufficient. Already in spec. |
| **Email notifications** | Standard SaaS feature. | Local tool, no email infrastructure. Adding SMTP config, templates, delivery tracking is heavy for a v1 local tool. | In-app notifications only for v1. Slack webhook is simpler if external notifications are needed later. |
| **Plugin/extension system** | "Make it extensible." | Plugin APIs are expensive to design, maintain, and document. They constrain internal refactoring. Premature for v1. | Build well-structured internal code. Plugins are a v2+ consideration if there is demand. |
| **AI-powered insights** | LangSmith has an "Insights Agent" that auto-analyzes traces. | Building an AI feature into an AI management tool is meta-complexity. Requires its own LLM calls, cost, and prompt engineering. | Surface the raw data well. Operators can draw their own conclusions from good charts and tables. |
| **Comprehensive audit logging** | Compliance requirement in enterprise. | For a local single-user tool, full audit trails with immutable logs are over-engineering. | Store approval history (already in spec). Add audit logging if/when multi-user support arrives. |

## Feature Dependencies

```
[Authentication (Devise)]
    |
    +--requires--> [Global Shell (Sidebar + Top Bar)]
    |                  |
    |                  +--requires--> [Dashboard Overview]
    |                  +--requires--> [Agent Fleet Screen]
    |                  +--requires--> [Task Board Screen]
    |                  +--requires--> [Approvals Screen]
    |                  +--requires--> [Usage & Cost Screen]
    |                  +--requires--> [Settings Screen]
    |
[Mock Data Layer]
    |
    +--requires--> [Agent Fleet Screen]
    +--requires--> [Task Board Screen]
    +--requires--> [Dashboard Overview]
    +--requires--> [Approvals Screen]
    +--requires--> [Usage & Cost Screen]

[Design System (colors, typography, components)]
    |
    +--requires--> [Every screen]

[Agent Fleet Screen]
    +--enhances--> [Dashboard Overview] (KPI: Active Agents)
    +--enhances--> [Task Board] (agent assignment dropdown)

[Task Board Screen]
    +--requires--> [Create New Task Modal]
    +--enhances--> [Approvals Screen] (tasks in Awaiting Approval link to approvals)
    +--enhances--> [Dashboard Overview] (KPI: Tasks in Progress, Recent Tasks table)

[Approvals Screen]
    +--enhances--> [Dashboard Overview] (KPI: Pending Approvals, Action Required sidebar)
    +--enhances--> [Task Board] (Awaiting Approval column links to approval detail)

[Usage & Cost Screen]
    +--enhances--> [Agent Fleet] (token usage sparklines per agent)
    +--enhances--> [Dashboard Overview] (KPI: Tokens Used)
    +--enhances--> [Settings Screen] (budget thresholds reference cost data)

[Settings Screen]
    +--configures--> [Usage & Cost Screen] (model pricing, budget limits)
    +--configures--> [Agent Fleet Screen] (auto-restart, allowed tools)
    +--configures--> [Dashboard Overview] (refresh interval)
```

### Dependency Notes

- **Global Shell requires Authentication:** Every page needs auth. The shell (sidebar + top bar) wraps all screens.
- **All screens require Mock Data Layer:** Gateway is not built. Every screen must render with realistic fake data. This is the unblocking dependency for the entire UI.
- **All screens require Design System:** Dark theme tokens, component patterns, and typography must be established before building screens, or every screen gets inconsistent.
- **Dashboard Overview is the integration layer:** It pulls KPIs and previews from every other screen. Build it last (or build KPI components as each screen is completed).
- **Task Board requires Create New Task:** The "New Task" button appears on both Task Board and Dashboard. The modal is tightly coupled to the board.
- **Approvals and Task Board are bidirectional:** Tasks in "Awaiting Approval" link to the Approvals screen, and approvals link back to task context. Build them in sequence or together.
- **Settings configures but does not block:** Settings values (refresh rate, budgets, pricing) have sensible defaults. Settings screen can be built last.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to validate that the dashboard is useful for an OpenClaw operator.

- [ ] **Authentication (Devise)** -- gate everything behind login
- [ ] **Design system foundation** -- dark theme tokens, base components (cards, badges, buttons, tables, inputs)
- [ ] **Global shell** -- sidebar nav, top bar with search placeholder, notification placeholder
- [ ] **Mock data layer** -- realistic fake agents, tasks, approvals, usage metrics
- [ ] **Agent Fleet screen** -- grid/table view of agents with status, task, uptime, tokens, context menu
- [ ] **Task Board screen** -- Kanban columns with task cards, priority system, drag-and-drop
- [ ] **Create New Task modal** -- form with agent assignment, description, priority
- [ ] **Approvals screen** -- pending queue with approve/deny, expanded agent reasoning, history tab
- [ ] **Dashboard overview** -- KPI cards, agent activity timeline, recent tasks table, action required sidebar
- [ ] **Usage & Cost screen** -- KPI cards, token usage chart, cost breakdown, latency distribution, export
- [ ] **Settings screen** -- general preferences, agent policies, notifications, data sources tabs
- [ ] **Responsive layout** -- mobile/tablet/desktop breakpoints

### Add After Validation (v1.x)

Features to add once the core UI is working and the Gateway is available.

- [ ] **Gateway WebSocket integration** -- replace mock data with live presence events and agent lifecycle events
- [ ] **Live approval notifications** -- push notification when new approval arrives (WebSocket or polling)
- [ ] **Task dispatch to Gateway** -- actually send `agent` RPC when creating tasks
- [ ] **JSONL session viewer** -- expandable panel showing parsed session data for a task
- [ ] **Report export** -- CSV/PDF export of usage data
- [ ] **Agent actions** -- restart, disable, view logs via context menu (requires Gateway)
- [ ] **Budget-triggered approvals** -- CC monitors token spend and auto-creates approval items at thresholds

### Future Consideration (v2+)

Features to defer until the product is validated and Gateway integration is stable.

- [ ] **Session transcript replay** -- full conversational replay of agent sessions (AgentOps-style time-travel)
- [ ] **Slack/webhook notifications** -- external notification channels beyond in-app
- [ ] **Queue lane visualization** -- detailed view of Gateway queue state, concurrency slots, session key grouping
- [ ] **Agent log tailing** -- live streaming logs from agent sessions
- [ ] **Batch operations** -- bulk approve, bulk task creation, bulk agent restart
- [ ] **Custom dashboards** -- user-configurable dashboard layouts (Grafana-style)
- [ ] **API for external tools** -- REST API for programmatic access to CC data
- [ ] **Multi-product context** -- task creation with product selector for multi-product OpenClaw setups

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Design system (dark theme, components) | HIGH | MEDIUM | P1 |
| Authentication (Devise) | HIGH | LOW | P1 |
| Global shell (sidebar, top bar) | HIGH | MEDIUM | P1 |
| Mock data layer | HIGH | MEDIUM | P1 |
| Agent Fleet screen | HIGH | MEDIUM | P1 |
| Task Board (Kanban) | HIGH | HIGH | P1 |
| Approvals screen | HIGH | HIGH | P1 |
| Dashboard overview | HIGH | HIGH | P1 |
| Create New Task modal | HIGH | LOW | P1 |
| Usage & Cost screen | MEDIUM | HIGH | P1 |
| Settings screen | MEDIUM | MEDIUM | P1 |
| Responsive layout | MEDIUM | MEDIUM | P1 |
| Gateway WebSocket integration | HIGH | HIGH | P2 |
| Live approval notifications | HIGH | MEDIUM | P2 |
| Task dispatch to Gateway | HIGH | MEDIUM | P2 |
| JSONL session viewer | MEDIUM | MEDIUM | P2 |
| Report export (CSV/PDF) | LOW | MEDIUM | P2 |
| Agent actions (restart, disable) | MEDIUM | MEDIUM | P2 |
| Budget-triggered approvals | MEDIUM | MEDIUM | P2 |
| Session transcript replay | MEDIUM | HIGH | P3 |
| Slack/webhook notifications | LOW | MEDIUM | P3 |
| Queue lane visualization | LOW | HIGH | P3 |
| Custom dashboards | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (all 7 screens with mock data)
- P2: Should have once Gateway exists (real data, live features)
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | CrewAI | AutoGen Studio | LangSmith | Datadog LLM Obs | AgentOps | Langfuse | OpenClaw CC |
|---------|--------|----------------|-----------|------------------|----------|----------|-------------|
| Agent status overview | Yes (deployment view) | Yes (team view) | No (trace-focused) | Yes (service map) | Yes (session view) | No (trace-focused) | **Yes (fleet grid/table)** |
| Task/workflow board | No | Yes (playground) | No | No | No | No | **Yes (Kanban)** |
| Approval workflow | No | No | No | No | No | No | **Yes (full HITL queue)** |
| Token/cost tracking | Yes | Yes (basic) | Yes (detailed) | Yes (detailed) | Yes (detailed) | Yes (detailed) | **Yes (per-agent)** |
| Session replay | No | No | Yes (trace tree) | Yes (trace graph) | Yes (time-travel) | Yes (trace tree) | **Deferred to v2** |
| Task creation/dispatch | Yes (via API) | Yes (playground) | No | No | No | No | **Yes (New Task modal)** |
| Real-time updates | Yes (streaming) | Yes (WebSocket) | Yes (polling) | Yes (streaming) | Yes (live) | Yes (async) | **Mock first, WS later** |
| LLM evaluation | No | No | Yes (core feature) | Yes (experiments) | No | Yes (LLM-as-judge) | **No (out of scope)** |
| Self-hosted/local | No (cloud only) | Yes (local) | No (cloud) | No (cloud) | No (cloud) | Yes (self-host) | **Yes (local-only)** |
| Dark mode | Yes | No | No | Yes | No | No | **Yes (primary)** |
| Data-dense ops UI | No (consumer style) | No (consumer style) | Partially | Yes | No | Partially | **Yes (Grafana-inspired)** |
| Cost control (pause agent) | No | No | No | No | Alerts only | No | **Yes (budget approvals)** |

### Key Competitive Insights

1. **No one does approval workflows in the dashboard.** Most tools externalize HITL to the agent framework. OpenClaw CC embedding approvals with agent reasoning is genuinely unique.

2. **Task creation + monitoring in one tool is rare.** Most observability tools are read-only. AutoGen Studio has a playground, and CrewAI has API-driven execution, but neither has a Kanban-style task management view.

3. **Local-first is a clear niche.** Only AutoGen Studio and Langfuse can run locally, and Langfuse requires a complex stack (Postgres + Clickhouse + Redis + S3). OpenClaw CC with just Postgres is the simplest local option.

4. **The Grafana/Datadog aesthetic is underserved in AI tooling.** Most AI agent dashboards look like consumer SaaS. Operators who spend all day in Grafana/Datadog will feel at home in OpenClaw CC.

5. **Cost control (not just cost visibility) is a gap.** Everyone can show you token costs. Nobody pauses an agent automatically when it approaches budget. OpenClaw CC's budget-triggered approvals close this loop.

## Sources

- [CrewAI Platform](https://crewai.com/) -- deployment management, RBAC, performance dashboards
- [CrewAI AMP](https://crewai.com/amp) -- enterprise tracing, unified control plane
- [AutoGen Studio](https://microsoft.github.io/autogen/dev//user-guide/autogenstudio-user-guide/index.html) -- team builder, playground, gallery, profiling
- [LangSmith Observability](https://www.langchain.com/langsmith/observability) -- tracing, side-by-side comparisons, Insights Agent
- [Datadog LLM Observability](https://www.datadoghq.com/product/ai/llm-observability/) -- agent monitoring, decision graph, framework integrations
- [Langfuse](https://langfuse.com/) -- open source, self-hosted, token tracking, prompt management
- [AgentOps](https://www.agentops.ai/) -- session replay, cost tracking, failure detection, 400+ integrations
- [Top 5 AI Agent Observability Platforms 2026](https://o-mega.ai/articles/top-5-ai-agent-observability-platforms-the-ultimate-2026-guide) -- cross-platform feature comparison
- [15 AI Agent Observability Tools 2026](https://aimultiple.com/agentic-monitoring) -- detailed feature matrix
- [AI Agent Monitoring Best Practices](https://uptimerobot.com/knowledge-hub/monitoring/ai-agent-monitoring-best-practices-tools-and-metrics/) -- metrics, KPIs, alert thresholds
- [Human-in-the-Loop Best Practices](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo) -- approval patterns, tool-level HITL
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/) -- data-dense UX patterns
- [Datadog Effective Dashboards](https://github.com/DataDog/effective-dashboards/blob/main/guidelines.md) -- widget grouping, color strategy
- [Vibe Kanban](https://vibekanban.com/) -- Kanban for AI agents, parallel execution
- [State of Agent Engineering](https://www.langchain.com/state-of-agent-engineering) -- 89% observability adoption, eval maturity data

---
*Feature research for: AI Agent Management Dashboard (OpenClaw Command Center)*
*Researched: 2026-03-25*
