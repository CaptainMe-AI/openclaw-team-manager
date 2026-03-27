---
phase: 5
slug: agent-fleet
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-27
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec 8.0.4 + Factory Bot 6.5.1 |
| **Config file** | `source/dashboard/spec/rails_helper.rb` |
| **Quick run command** | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/agents_spec.rb -x` |
| **Full suite command** | `cd source/dashboard && bundle exec rspec` |
| **Estimated runtime** | ~15 seconds (quick), ~45 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `cd source/dashboard && bundle exec rspec spec/requests/api/v1/agents_spec.rb -x`
- **After every plan wave:** Run `cd source/dashboard && bundle exec rspec`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | AGNT-01, AGNT-02, AGNT-04 | unit (request spec) | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/agents_spec.rb -x` | Exists (new examples added by task) | pending |
| 05-01-02 | 01 | 1 | AGNT-01 | compile check | `cd source/dashboard && npx tsc --noEmit` | n/a (type check) | pending |
| 05-02-01 | 02 | 2 | AGNT-01, AGNT-03, AGNT-04, AGNT-06 | compile check | `cd source/dashboard && npx tsc --noEmit` | n/a (type check) | pending |
| 05-02-02 | 02 | 2 | AGNT-01, AGNT-04 | compile check | `cd source/dashboard && npx tsc --noEmit` | n/a (type check) | pending |
| 05-03-01 | 03 | 3 | AGNT-02, AGNT-05, AGNT-06 | compile check | `cd source/dashboard && npx tsc --noEmit` | n/a (type check) | pending |
| 05-03-02 | 03 | 3 | AGNT-02, AGNT-05, AGNT-06 | compile check | `cd source/dashboard && npx tsc --noEmit` | n/a (type check) | pending |

*Status: pending -- will be updated during execution*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements:

- `source/dashboard/spec/requests/api/v1/agents_spec.rb` -- exists, Plan 01 Task 1 adds enriched field examples
- `source/dashboard/spec/factories/agents.rb` -- exists
- `source/dashboard/spec/factories/tasks.rb` -- exists
- `source/dashboard/spec/factories/usage_records.rb` -- exists
- RSpec, Factory Bot, Faker all installed and configured from Phase 01

No Wave 0 setup needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Grid view shows agent cards with icon, name, status badge, sparkline | AGNT-01 | Visual layout verification | Run `bin/dev`, navigate to /agents, verify card layout matches UI-SPEC |
| Disabled agents render at 50% opacity | AGNT-06 | Visual CSS check | In /agents, find a disabled agent card and verify opacity reduction |
| Error agents show red border | AGNT-06 | Visual CSS check | In /agents, find an error agent card and verify red border |
| Context menu appears on ellipsis click | AGNT-05 | Interactive UI behavior | Click ellipsis on an agent card, verify dropdown appears with 3 actions |
| Table view sortable column headers | AGNT-02 | Interactive UI behavior | Switch to table view, click column headers, verify sort icons and data reorder |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
