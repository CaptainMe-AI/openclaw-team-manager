# OpenClaw Setup Guide

How to set up OpenClaw so the Team Manager can connect to it.

## Architecture

```
┌─────────────────────┐       WebSocket        ┌──────────────────┐
│   Team Manager      │◄──────────────────────►│  OpenClaw Gateway │
│   (Rails + React)   │    ws://127.0.0.1:18789 │  (WebSocket srv) │
│                     │                         └──────────────────┘
│   localhost:3000    │       Filesystem              │
│                     │◄──────────────────┐           │
└─────────────────────┘                   │           │
         │                          ┌─────┴───────────┴──┐
         │                          │   ~/.openclaw/      │
         └──── same machine ───────►│   (config + data)   │
                                    └────────────────────┘
```

The Team Manager runs on the same machine as OpenClaw. It connects via two channels:

1. **Gateway WebSocket** -- real-time agent lifecycle events, presence, approvals
2. **Filesystem reads** -- agent config, session transcripts, token usage data

## Prerequisites

- OpenClaw installed and configured at `~/.openclaw/`
- OpenClaw Gateway running (WebSocket server)
- Team Manager set up per the [README](README.md)

## 1. OpenClaw Directory Structure

The Team Manager expects the standard OpenClaw directory layout:

```
~/.openclaw/
├── openclaw.json              # Main config (agent list, models)
├── agents/
│   ├── <agent-id>/
│   │   ├── IDENTITY.md        # Agent name, emoji, description
│   │   ├── ROLE.md            # Agent role definition
│   │   └── sessions/
│   │       ├── <session>.jsonl # Session transcripts with token usage
│   │       └── ...
│   └── ...
└── shared/
    └── products/              # Product context directories (optional)
```

### Key files the Team Manager reads

| File | What it provides |
|------|------------------|
| `openclaw.json` | Agent list (`agents.list[]`), each with `id`, `name`, `workspace`, `model` |
| `<agent>/IDENTITY.md` | Agent display name and emoji for the UI |
| `<agent>/sessions/*.jsonl` | Token usage (`input_tokens`, `output_tokens` per turn), session transcripts |

### Session JSONL format

Each assistant turn in a session file contains usage metadata:

```jsonl
{"role":"assistant","content":"...","usage":{"input_tokens":1250,"output_tokens":340}}
```

The Team Manager aggregates these across agents for usage charts and cost calculations.

## 2. OpenClaw Gateway

The Gateway is a WebSocket server that the Team Manager connects to for real-time data.

### Default endpoint

```
ws://127.0.0.1:18789
```

### Authentication

The Gateway expects an auth token in the WebSocket handshake:

```json
{
  "params": {
    "auth": {
      "token": "<OPENCLAW_GATEWAY_TOKEN>"
    }
  }
}
```

Set the `OPENCLAW_GATEWAY_TOKEN` environment variable, or configure the token directly in the Team Manager UI (Settings > Data Sources > Auth Token).

### Events the Team Manager subscribes to

| Event | Purpose |
|-------|---------|
| `presence` | Agent online/offline/idle status |
| `agent` (lifecycle: `start`) | Task started executing |
| `agent` (lifecycle: `end`) | Task completed |
| `agent` (lifecycle: `error`) | Task failed |
| `agent` (lifecycle: `tool_start`, `needsApproval: true`) | Approval required |

### RPC methods the Team Manager calls

| Method | Purpose |
|--------|---------|
| `system-presence` | Get current presence state of all agents on connect |
| `agent` | Dispatch a task to an agent (`{sessionKey, prompt}`) |
| `agent.approve` | Send approval decision (`{runId, decision: "approved"\|"denied"}`) |

## 3. Configure Team Manager

### Via the Settings UI

1. Start the Team Manager: `bin/dev` (from `source/dashboard/`)
2. Log in at `http://localhost:3000`
3. Go to **Settings > Data Sources**
4. Configure:

| Setting | Value | Notes |
|---------|-------|-------|
| Gateway WebSocket URL | `ws://127.0.0.1:18789` | Adjust if Gateway runs on a different port |
| Auth Token | Your gateway token | From `OPENCLAW_GATEWAY_TOKEN` env var |
| OpenClaw Home Directory | `~/.openclaw` | Adjust if non-standard location |
| Agent Session Path | `~/.openclaw/agents/` | Where session JSONL files live |
| Data Refresh Interval | `5` (seconds) | How often to poll filesystem for new data |

5. Click **Save Configuration**

### Via database seeds

Default values are set during `rake db:seed`. To change defaults, edit `source/dashboard/db/seeds.rb` (lines 276-280):

```ruby
{ key: 'datasource.gateway_url', value: { url: 'ws://localhost:4080' } },
{ key: 'datasource.openclaw_home', value: { path: '~/.openclaw' } },
{ key: 'datasource.auth_token', value: { token: '' } },
{ key: 'datasource.session_path', value: { path: '~/.openclaw/agents/' } },
{ key: 'datasource.refresh_interval', value: { seconds: 5 } }
```

## 4. Data Flow

Once connected, data flows through the Team Manager like this:

### Real-time (Gateway WebSocket)

```
Gateway event ──► Rails backend (ActionCable) ──► PostgreSQL ──► React (TanStack Query)
```

- Agent presence changes update the Agents page in real-time
- New approval requests appear on the Approvals page and Dashboard
- Task state transitions move Kanban cards automatically

### Filesystem polling

```
~/.openclaw/agents/*/sessions/*.jsonl ──► Rails service layer ──► PostgreSQL ──► React
```

- Token usage aggregated for Usage & Cost charts
- Session transcripts parsed for task details
- Polled at the configured refresh interval

### Approval workflow

```
Agent needs approval ──► Gateway sends tool_start event ──► Team Manager shows card
Operator clicks Approve ──► Team Manager sends agent.approve RPC ──► Agent resumes
```

## 5. Cost Calculation

The Team Manager calculates costs from token usage data using per-model pricing stored in its settings. It reads `input_tokens` and `output_tokens` from session JSONL files and multiplies by the configured rate for each model (Opus, Sonnet, etc.).

Cost = (input_tokens x input_rate) + (output_tokens x output_rate)

## Current Status

**v1.0 uses mock data.** The Team Manager is fully built with a service abstraction layer designed for Gateway integration. All controllers call service objects (`AgentService`, `TaskService`, etc.) that currently read from PostgreSQL seed data. When the Gateway is ready, a `GatewayService` will implement the same interface -- no frontend or controller changes needed.

To use the Team Manager today with mock data, just follow the [README](README.md) setup. No OpenClaw installation is required -- the seed data provides realistic agents, tasks, approvals, and usage metrics.
