# Phase 1: Foundation - Discussion Log (Assumptions Mode)

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the analysis.

**Date:** 2026-03-25
**Phase:** 01-Foundation
**Mode:** assumptions
**Areas analyzed:** Rails App Generation, Database Configuration, Gem Version Alignment, Frontend Tooling, Test Framework & E2E Setup

## Assumptions Presented

### Rails App Generation Strategy
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Full Rails mode (not --api), --skip-javascript, add vite_rails separately | Likely | `source/dashboard/` empty, Devise needs session middleware, ActionCable needed later |

### Database Configuration
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| UUID globally via generator config, Docker PG port 5411 | Confident | `setup/Dockerfile-local-services.yml` lines 6-10, FOUN-02 requirement |

### Gem Version Alignment
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Rails 8.0.5, Devise 5.0.3, vite_rails 3.10.0, annotaterb ~> 4.22 | Confident (after research) | RubyGems API verification for all versions |

### Frontend Tooling
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| vite_rails + React 19 TypeScript + Tailwind v4 @tailwindcss/vite | Confident | CLAUDE.md explicit requirement, vite_rails 3.10.0 Rails 8 compatible |

### Test Framework & E2E Setup
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Full RSpec + FactoryBot + Faker + RuboCop + Playwright setup | Likely | FOUN-07 through FOUN-10, success criteria #4 |

## Corrections Made

### Test Framework
- **Original assumption:** At least one model spec and one request spec; Playwright E2E scaffolded
- **User correction:** For RSpec API tests, use request specs only — no controller specs
- **Reason:** User preference for request spec pattern over controller specs

## External Research

- Rails 8.0.5: Confirmed on RubyGems, released 2026-03-24 (Source: rubygems.org/gems/rails)
- Devise 5.0.3: Confirmed on RubyGems, released 2026-03-16 (Source: rubygems.org/gems/devise)
- vite_rails: Use 3.10.0, not 3.0.17 from stale citation (Source: rubygems.org/gems/vite_rails)
- Annotate: Use annotaterb ~> 4.22 — original annotate gem incompatible with Rails 8 (Source: rubygems.org/gems/annotaterb)
