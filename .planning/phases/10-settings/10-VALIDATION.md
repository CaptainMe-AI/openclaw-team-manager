# Phase 10: Settings — Validation Architecture

**Phase:** 10-settings
**Requirements:** SETT-01, SETT-02, SETT-03, SETT-04, SETT-05, SETT-06

## Test Framework

| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.4 + TypeScript compiler |
| Config file | `spec/rails_helper.rb` (RSpec) |
| Quick run | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/settings_spec.rb` |
| Type check | `cd source/dashboard && npx tsc --noEmit` |
| Full suite | `cd source/dashboard && bundle exec rspec` |

## Per-Task Verification

| Plan | Task | Verify Command | What It Checks |
|------|------|----------------|----------------|
| 10-01 | T1: Fix SettingsService + seeds | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/settings_spec.rb -x --format progress` | All 5 request specs pass (show/update no longer 500) |
| 10-01 | T2: Toggle/FormRow/Tabs/types | `cd source/dashboard && npx tsc --noEmit` | All new TypeScript files compile without errors |
| 10-02 | T1: 5 tab components | `cd source/dashboard && npx tsc --noEmit` | All tab components compile with correct prop types |
| 10-02 | T2: SettingsPage composition | `cd source/dashboard && npx tsc --noEmit` | Full page compiles, all imports resolve |

## Requirements -> Test Map

| Req ID | Behavior | Test Type | Command | Exists? |
|--------|----------|-----------|---------|---------|
| SETT-01 | General tab renders 3 fields | TypeScript compile | `npx tsc --noEmit` | Plan 10-02 |
| SETT-02 | Agents tab renders toggle, budget, chips | TypeScript compile | `npx tsc --noEmit` | Plan 10-02 |
| SETT-03 | Notifications tab renders 4 thresholds | TypeScript compile | `npx tsc --noEmit` | Plan 10-02 |
| SETT-04 | Data Sources tab renders 5 fields | TypeScript compile + seed count | `npx tsc --noEmit` + rspec | Plan 10-01 (seeds) + 10-02 (UI) |
| SETT-05 | Save persists, Discard reverts | Request spec (API) + TypeScript compile (UI) | rspec + `npx tsc --noEmit` | Plan 10-01 (API fix) + 10-02 (UI) |
| SETT-06 | Tab navigation switches content | TypeScript compile | `npx tsc --noEmit` | Plan 10-01 (SettingsTabs) + 10-02 (wiring) |

## Wave Sampling

| Wave | Plans | Sampling Command |
|------|-------|-----------------|
| 1 (10-01) | Backend fix + UI infrastructure | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/settings_spec.rb -x --format progress && npx tsc --noEmit` |
| 2 (10-02) | Settings page composition | `cd source/dashboard && npx tsc --noEmit && bundle exec rspec --format progress` |

## Phase Gate

Before `/gsd:verify-work`: `cd source/dashboard && bundle exec rspec --format progress && npx tsc --noEmit && bin/rubocop -A .`

## Notes

- E2E Playwright tests not created for this phase per established project pattern (frontend-only validation via compile check + manual review for mock data screens)
- Visual verification done via `bin/dev` and browser inspection at `/settings`
