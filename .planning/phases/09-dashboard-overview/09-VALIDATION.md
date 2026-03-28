---
phase: 09
slug: dashboard-overview
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec 8.x (backend), TypeScript compiler (frontend) |
| **Config file** | source/dashboard/.rspec |
| **Quick run command** | `cd source/dashboard && bundle exec rspec spec/services/dashboard_service_spec.rb spec/requests/api/v1/dashboard_spec.rb --format progress` |
| **Full suite command** | `cd source/dashboard && bundle exec rspec --format progress` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | DASH-01, DASH-02, DASH-03, DASH-04 | unit + request | `cd source/dashboard && bundle exec rspec spec/services/dashboard_service_spec.rb spec/requests/api/v1/dashboard_spec.rb` | ✅ | ⬜ pending |
| 09-02-01 | 02 | 2 | DASH-01, DASH-05, DASH-06 | compile check | `cd source/dashboard && npx tsc --noEmit` | ✅ | ⬜ pending |
| 09-02-02 | 02 | 2 | DASH-02, DASH-03, DASH-04 | compile check | `cd source/dashboard && npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. RSpec and TypeScript compiler already configured.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Activity timeline color-coded dots with hover tooltips | DASH-02 | Visual behavior requires browser | Open /, hover over timeline dots, verify colors match agent status |
| Inline approve/deny buttons work in sidebar | DASH-04 | User interaction flow | Click approve on a pending approval in sidebar, verify it disappears from pending |
| Time period selector updates all dashboard sections | DASH-05 | Visual state change | Switch from 24h to 7d, verify KPI numbers and timeline change |
| New Task button opens create modal | DASH-06 | UI interaction | Click "New Task" button, verify modal opens with form fields |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
