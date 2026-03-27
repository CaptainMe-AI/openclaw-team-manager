---
phase: 4
slug: data-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec 8.0.4 (backend), Vitest (frontend — if configured) |
| **Config file** | `source/dashboard/spec/rails_helper.rb` |
| **Quick run command** | `cd source/dashboard && bundle exec rspec --fail-fast` |
| **Full suite command** | `cd source/dashboard && bundle exec rspec` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd source/dashboard && bundle exec rspec --fail-fast`
- **After every plan wave:** Run `cd source/dashboard && bundle exec rspec`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DATA-01 | unit | `bundle exec rspec spec/models/` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DATA-01 | unit | `bundle exec rspec spec/models/` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | DATA-02 | request | `bundle exec rspec spec/requests/` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | DATA-03 | unit | `bundle exec rspec spec/services/` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | DATA-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | DATA-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `spec/models/agent_spec.rb` — model validation and association stubs
- [ ] `spec/models/task_spec.rb` — model validation and enum stubs
- [ ] `spec/requests/api/v1/` — request spec directory structure
- [ ] `spec/services/` — service object spec directory structure
- [ ] `spec/rails_helper.rb` — verify factory_bot and faker loaded
- [ ] Frontend test runner (vitest) — if not yet configured for React hooks

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Seed data realism | DATA-01 | Visual inspection of agent names, task descriptions | Run `rails db:seed` and inspect via `rails console` |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
