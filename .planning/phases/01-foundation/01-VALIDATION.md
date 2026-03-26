---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | rspec-rails ~> 8.0.4 |
| **Config file** | source/dashboard/spec/rails_helper.rb |
| **Quick run command** | `cd source/dashboard && bundle exec rspec --fail-fast` |
| **Full suite command** | `cd source/dashboard && bundle exec rspec` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd source/dashboard && bundle exec rspec --fail-fast`
- **After every plan wave:** Run `cd source/dashboard && bundle exec rspec`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| *To be filled by planner* | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] RSpec + factory_bot_rails installed and configured
- [ ] `spec/rails_helper.rb` — shared configuration
- [ ] `spec/support/factory_bot.rb` — FactoryBot integration
- [ ] RuboCop configured with rubocop-rails + rubocop-rspec

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `bin/dev` starts both Rails and Vite | FOUN-01 | Process management | Run `bin/dev`, verify both servers start |
| Browser loads React app | FOUN-03 | Visual verification | Navigate to localhost:3000, verify React renders |
| Login form works with session persistence | FOUN-06 | E2E user flow | Log in, refresh page, verify session persists |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
