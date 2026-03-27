# Phase 4: Data Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the conversation.

**Date:** 2026-03-26
**Phase:** 04-data-layer
**Mode:** discuss
**Areas discussed:** Schema design, Mock data service pattern, Seed data realism, API filtering & pagination

## Areas Selected

All 4 areas selected for discussion.

## Discussion Summary

### Schema Design — Agent Model
- **Options presented:** Full agent record vs Lightweight agent + config JSON vs Claude decides
- **User chose:** Full agent record — dedicated columns for name, agent_id, status enum, model_name, workspace, uptime_since
- **Rationale:** Explicit columns match UI spec fields, better queryability than JSONB

### Schema Design — Task Status
- **Options presented:** String enum column vs Integer status + position
- **User chose:** String enum column — status maps 1:1 to Kanban columns (backlog, queued, in_progress, awaiting_approval, completed, failed)
- **Rationale:** Clean enum mapping, priority as integer (0-3), display ID for human-readable references

### Schema Design — Approval Model
- **Options presented:** Single table with type enum vs STI vs Claude decides
- **User chose:** Single table with type enum — approval_type enum (dangerous_command, sensitive_data, budget_override), JSONB context for type-specific details
- **Rationale:** Simpler queries, one controller, flexible context storage

### Schema Design — Usage Records
- **Options presented:** Granular usage records (hourly) vs Daily summary table vs Claude decides
- **User chose:** Granular hourly records — input_tokens, output_tokens, api_calls, cost_cents per agent per hour
- **Rationale:** Supports time-series charts with SQL GROUP BY aggregation

### Schema Design — Settings
- **Options presented:** Key-value Setting model vs Structured Settings table vs Claude decides
- **User chose:** Key-value with key (string, unique) + value (jsonb), dot notation keys
- **Rationale:** Flexible schema, no migrations for new settings

### Mock Data Service Pattern
- **Options presented:** Per-resource service objects vs Unified DataService facade vs No service layer yet vs Claude decides
- **User chose:** Per-resource service objects — AgentService, TaskService, ApprovalService, UsageService
- **Rationale:** Controllers call services, services wrap ActiveRecord, internals swappable for Gateway later

### Seed Data Realism
- **Scale options:** Busy fleet vs Minimal viable vs Claude decides
- **User chose:** Busy fleet — 6 agents, ~35 tasks, ~12 approvals, 7 days hourly usage (~1,008 records)
- **Style options:** OpenClaw-themed realistic vs Generic Faker vs Claude decides
- **User chose:** OpenClaw-themed — agent names like "docs-writer", task descriptions like "Refactor auth middleware"

### API Filtering & Pagination
- **Filter options:** Full filtering now vs Basic list + show only vs Claude decides
- **User chose:** Full filtering — status, agent_id, priority filters, pagy pagination, sort support, date range for usage
- **Shape options:** Flat with IDs vs Nested associations vs Claude decides
- **User chose:** Flat with IDs — denormalized convenience fields (agent_name) but no nested full objects

## Deferred Ideas

- ActionCable real-time channels — future phase
- Global search via pg_search — separate phase
- Optimistic updates — UI feature phase
- Task drag-and-drop reordering — Task Board UI phase
