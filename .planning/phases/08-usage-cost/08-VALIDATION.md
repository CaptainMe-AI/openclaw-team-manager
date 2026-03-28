---
phase: 8
slug: usage-cost
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec (Rails), Vitest/Jest (React) |
| **Config file** | `source/dashboard/spec/rails_helper.rb`, `source/dashboard/vite.config.ts` |
| **Quick run command** | `cd source/dashboard && bin/rspec spec/requests/api/v1/usage_spec.rb` |
| **Full suite command** | `cd source/dashboard && bin/rspec && npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd source/dashboard && bin/rspec spec/requests/api/v1/usage_spec.rb`
- **After every plan wave:** Run `cd source/dashboard && bin/rspec && npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | USAG-01 | request | `bin/rspec spec/requests/api/v1/usage_spec.rb` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | USAG-04 | request | `bin/rspec spec/requests/api/v1/usage_spec.rb` | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | USAG-05 | request | `bin/rspec spec/requests/api/v1/usage_spec.rb` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 2 | USAG-01 | visual | Manual — KPI cards render with trends | N/A | ⬜ pending |
| 08-02-02 | 02 | 2 | USAG-02 | visual | Manual — stacked area chart renders | N/A | ⬜ pending |
| 08-02-03 | 02 | 2 | USAG-03 | visual | Manual — donut chart renders | N/A | ⬜ pending |
| 08-02-04 | 02 | 2 | USAG-04 | visual | Manual — horizontal bar chart renders | N/A | ⬜ pending |
| 08-02-05 | 02 | 2 | USAG-05 | visual | Manual — histogram renders | N/A | ⬜ pending |
| 08-02-06 | 02 | 2 | USAG-06 | visual | Manual — time period selector works | N/A | ⬜ pending |
| 08-02-07 | 02 | 2 | USAG-07 | unit | Manual — CSV export downloads | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Extend `spec/requests/api/v1/usage_spec.rb` — add specs for chart aggregation endpoints
- [ ] Add factory traits for `usage_record` with `latency_ms` and `endpoint` attributes

*Existing infrastructure covers test framework — only test files need creation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| KPI cards render with correct values and trend arrows | USAG-01 | Visual chart rendering | Navigate to /usage, verify 4 KPI cards with numbers and trend indicators |
| Stacked area chart shows per-agent token usage | USAG-02 | SVG chart rendering | Verify stacked area chart with legend showing agent names |
| Donut chart shows cost breakdown | USAG-03 | SVG chart rendering | Verify donut/pie chart with agent cost percentages |
| Horizontal bar chart shows API calls | USAG-04 | SVG chart rendering | Verify horizontal bars with endpoint labels |
| Histogram shows latency distribution | USAG-05 | SVG chart rendering | Verify histogram with latency buckets |
| Time period selector updates all charts | USAG-06 | Interactive state | Click each time period button, verify all charts refresh |
| CSV export downloads file | USAG-07 | Browser download | Click export, verify CSV file downloads with correct data |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
