---
phase: 04-data-layer
plan: 01
subsystem: database
tags: [activerecord, postgresql, migrations, factory-bot, faker, pagy, uuid, enums, jsonb]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Rails app scaffold, PostgreSQL Docker, UUID primary keys, Devise User model
provides:
  - Agent model with status enum (active/idle/error/disabled) and fleet associations
  - Task model with 6-column Kanban status enum and priority validation (0-3)
  - Approval model with 3 enums (approval_type/status/risk_level) and JSONB context
  - UsageRecord model with composite agent+time index for hourly metrics
  - Setting model with unique key-value pattern and JSONB value
  - Pagy pagination configuration (limit=25, max_limit=100)
  - FactoryBot factories for all 5 models
  - Faker-generated seed data: 6 agents, 35 tasks, 12 approvals, 1008 usage records, 12 settings
affects: [04-02, 04-03, 05-api-endpoints, 06-react-hooks, 07-dashboard, 08-agents, 09-tasks, 10-approvals]

# Tech tracking
tech-stack:
  added: [pagy]
  patterns: [string-backed-enums, jsonb-context-column, composite-index, uuid-foreign-keys, idempotent-seeds]

key-files:
  created:
    - source/dashboard/app/models/agent.rb
    - source/dashboard/app/models/task.rb
    - source/dashboard/app/models/approval.rb
    - source/dashboard/app/models/usage_record.rb
    - source/dashboard/app/models/setting.rb
    - source/dashboard/db/migrate/20260327152046_create_agents.rb
    - source/dashboard/db/migrate/20260327152053_create_tasks.rb
    - source/dashboard/db/migrate/20260327152054_create_approvals.rb
    - source/dashboard/db/migrate/20260327152055_create_usage_records.rb
    - source/dashboard/db/migrate/20260327152056_create_settings.rb
    - source/dashboard/config/initializers/pagy.rb
    - source/dashboard/spec/factories/agents.rb
    - source/dashboard/spec/factories/tasks.rb
    - source/dashboard/spec/factories/approvals.rb
    - source/dashboard/spec/factories/usage_records.rb
    - source/dashboard/spec/factories/settings.rb
    - source/dashboard/spec/models/agent_spec.rb
    - source/dashboard/spec/models/task_spec.rb
    - source/dashboard/spec/models/approval_spec.rb
    - source/dashboard/spec/models/usage_record_spec.rb
    - source/dashboard/spec/models/setting_spec.rb
  modified:
    - source/dashboard/db/seeds.rb
    - source/dashboard/db/structure.sql

key-decisions:
  - "Renamed model_name column to llm_model to avoid ActiveRecord reserved attribute conflict"
  - "Used insert_all! for bulk usage record creation (1008 records) for seeding performance"
  - "Seed idempotency via return if Agent.exists? guard"

patterns-established:
  - "String-backed enums: enum :status, { active: 'active', idle: 'idle' } for PostgreSQL compatibility"
  - "JSONB context columns for type-specific metadata (approval context varies by approval_type)"
  - "Composite index on [agent_id, recorded_at] for time-series queries"
  - "Optional belongs_to with optional: true for nullable foreign keys"
  - "Idempotent seeds with existence check guard"

requirements-completed: [DATA-05, DATA-02]

# Metrics
duration: 8min
completed: 2026-03-27
---

# Phase 04 Plan 01: Models, Migrations, Factories, Specs, and Seed Data Summary

**5 ActiveRecord models with UUID PKs, string-backed enums, JSONB context, Pagy config, 61 passing model specs, and Faker-generated fleet of 6 agents with 1008 hourly usage records**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-27T15:18:55Z
- **Completed:** 2026-03-27T15:27:13Z
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- 5 ActiveRecord models (Agent, Task, Approval, UsageRecord, Setting) with complete enums, validations, and associations
- 61 model specs covering validations, enums, scopes, and associations (TDD: RED then GREEN)
- Realistic seed data: 6-agent fleet with varied statuses, 35 Kanban tasks, 12 approvals across all states, 7 days of hourly usage metrics
- Pagy pagination configured with limit=25 and max_limit=100

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrations, models, Pagy config, factories, and model specs**
   - `d9e9005` (test) - RED: failing specs, factories, Pagy initializer
   - `2f8123f` (feat) - GREEN: models, migrations, schema; all 61 specs pass
2. **Task 2: Seed data with Faker-generated realistic fleet** - `5a7879e` (feat)

## Files Created/Modified
- `source/dashboard/app/models/agent.rb` - Agent model with status enum, fleet associations
- `source/dashboard/app/models/task.rb` - Task model with 6-column Kanban status, priority 0-3
- `source/dashboard/app/models/approval.rb` - Approval model with 3 enums, JSONB context, resolved_by User FK
- `source/dashboard/app/models/usage_record.rb` - UsageRecord with agent association, recorded_at validation
- `source/dashboard/app/models/setting.rb` - Setting key-value model with unique key constraint
- `source/dashboard/db/migrate/20260327152046_create_agents.rb` - Agents table with UUID PK, indexes
- `source/dashboard/db/migrate/20260327152053_create_tasks.rb` - Tasks table with agent FK, status/priority indexes
- `source/dashboard/db/migrate/20260327152054_create_approvals.rb` - Approvals table with JSONB context, resolved_by FK
- `source/dashboard/db/migrate/20260327152055_create_usage_records.rb` - Usage records with composite index
- `source/dashboard/db/migrate/20260327152056_create_settings.rb` - Settings table with unique key index
- `source/dashboard/config/initializers/pagy.rb` - Pagy defaults: limit=25, max_limit=100
- `source/dashboard/spec/factories/*.rb` - 5 FactoryBot factories with Faker data
- `source/dashboard/spec/models/*.rb` - 5 model specs (61 examples total)
- `source/dashboard/db/seeds.rb` - Idempotent seed data with realistic fleet
- `source/dashboard/db/structure.sql` - Updated with all 5 new tables

## Decisions Made
- **Renamed model_name to llm_model:** ActiveRecord reserves `model_name` as a class method. The column was renamed to `llm_model` across all migrations, models, factories, and seeds to avoid `DangerousAttributeError`. This is a deviation from the plan that used `model_name` in the schema.
- **Bulk insert for usage records:** Used `insert_all!` for the 1008 usage records instead of individual `create!` calls for seeding performance.
- **Idempotency guard:** `return if Agent.exists?` at top of seeds.rb prevents duplicate data on re-run.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Renamed model_name column to llm_model**
- **Found during:** Task 1 (model creation)
- **Issue:** `model_name` is a reserved method in ActiveRecord (`ActiveRecord::DangerousAttributeError`). The plan specified `model_name` as a column on both agents and usage_records tables.
- **Fix:** Renamed to `llm_model` in migrations, models, factories, and seeds. Rolled back and re-ran migrations for both dev and test databases.
- **Files modified:** All migration files, factory files, model files, seeds.rb
- **Verification:** All 61 specs pass, seed data creates correctly
- **Committed in:** 2f8123f (Task 1 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug - reserved attribute name)
**Impact on plan:** Column rename from `model_name` to `llm_model` is the only change. No scope creep. All downstream code should reference `llm_model` instead of `model_name`.

## Issues Encountered
- ActiveRecord reserves `model_name` as a class method on all models. The `rails generate migration` command also rejects `model_name` as a field. Resolved by renaming to `llm_model`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 5 models are ready for API controller endpoints (Plan 02)
- Seed data provides realistic test data for all screens
- Factories are ready for controller and integration specs
- Pagy pagination is configured and ready for list endpoints

## Self-Check: PASSED

All 8 key files verified present. All 3 commits verified in git history.

---
*Phase: 04-data-layer*
*Completed: 2026-03-27*
