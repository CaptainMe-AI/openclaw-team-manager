# Phase 1: Foundation - Context

**Gathered:** 2026-03-25 (assumptions mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

A running Rails + React application with authentication, database, and dev tooling that all subsequent phases build on. Scaffolds the Rails app in `source/dashboard`, wires PostgreSQL in Docker, sets up Devise auth, configures Vite + React + Tailwind, and establishes the test framework. No UI screens — just the working foundation.

</domain>

<decisions>
## Implementation Decisions

### Rails App Generation
- **D-01:** Generate with `rails new source/dashboard --skip-javascript --database=postgresql` (full mode, NOT `--api`). Full mode is required for Devise session-based authentication (cookie middleware) and ActionCable (used in later phases).
- **D-02:** Add vite_rails after generation — `--skip-javascript` prevents Rails from adding importmap/esbuild which vite_rails replaces.

### Database Configuration
- **D-03:** PostgreSQL UUID primary keys configured globally via `config.generators { |g| g.orm :active_record, primary_key_type: :uuid }` — all models get UUID by default.
- **D-04:** Connect to existing Docker PostgreSQL on port 5411 with credentials from `setup/Dockerfile-local-services.yml` (user: `openclaw-team-manager`, password: `openclaw-team-manager-password`, trust auth).
- **D-05:** Create `env.sample.development` and `env.sample.test` files with database connection strings. Add `.env.development` and `.env.test.local` to `.gitignore`.
- **D-06:** Use `structure.sql` format (`config.active_record.schema_format = :sql`) per README's `schema_dump` reference requiring matching `pg_dump` version.

### Gem Versions
- **D-07:** Rails `~> 8.0.5` (confirmed available on RubyGems, released 2026-03-24). Stay on 8.0.x — do not use 8.1.x.
- **D-08:** Devise `~> 5.0.3` (confirmed available, released 2026-03-16). Rails 8 support included.
- **D-09:** vite_rails `~> 3.10` (3.10.0 is current — NOT 3.0.17 from stale CLAUDE.md Sources citation).
- **D-10:** Use `annotaterb ~> 4.22` for model annotations (FOUN-09). The original `annotate` gem is incompatible with Rails 8 (`activerecord < 8.0` constraint, last release 2022).
- **D-11:** solid_cable `~> 3.0`, rack-cors `~> 2.0`, pundit `~> 2.4`, pg_search `~> 2.3`, pagy `~> 9.x`, jbuilder `~> 3.0` per CLAUDE.md stack.

### Frontend Tooling
- **D-12:** vite_rails 3.10.0 manages Vite version — do NOT install Vite separately or upgrade beyond what vite_rails pins.
- **D-13:** React 19.2 with TypeScript 5.7.x. Use `.tsx` files. Install `@types/react` and `@types/react-dom`.
- **D-14:** Tailwind CSS v4.2.2 via `@tailwindcss/vite` plugin (NOT PostCSS). CSS-first configuration with `@theme` block.
- **D-15:** Rails serves SPA from a root controller action (e.g., `pages#app` or `root#index`) with Vite tag helpers (`vite_javascript_tag`, `vite_stylesheet_tag`).
- **D-16:** Use yarn as package manager (per README conventions).

### Test Framework
- **D-17:** RSpec with request specs only for API testing — NO controller specs. Model specs for unit testing.
- **D-18:** rspec-rails `~> 8.0.4`, factory_bot_rails `~> 6.5.1`, faker `~> 3.6.1`.
- **D-19:** RuboCop `~> 1.85` with rubocop-rails and rubocop-rspec extensions.
- **D-20:** cypress-on-rails `~> 1.17` with `--framework playwright` flag. @playwright/test `^1.52.x`.
- **D-21:** Phase 1 success requires at least one passing model spec and one passing request spec. Playwright E2E is configured but a passing E2E test is not required until Phase 3.

### Dev Server
- **D-22:** `bin/dev` uses Procfile.dev with foreman (system gem, not in Gemfile) to run Rails server + Vite dev server together.
- **D-23:** Rails on port 3000, Vite dev server on port 3036 (vite_rails default).

### Auth Setup
- **D-24:** Devise configured with session-based auth. User model with email/password. No signup routes — user created via `rails console` only.
- **D-25:** Seed a default admin user in `seeds.rb` for development convenience.

### Claude's Discretion
- Loading skeleton and error state design choices
- Exact RuboCop rule configuration beyond defaults
- Compression/optimization settings for Vite
- Temp file and log handling conventions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project setup
- `README.md` — Dev setup process, Ruby version, Docker commands, env file conventions, database setup steps
- `setup/Dockerfile-local-services.yml` — Docker compose for PostgreSQL (port, credentials, image version)

### Design specs (foundation-relevant sections only)
- `designs/UX_SPEC.md` — Overall layout patterns and interaction conventions (informs SPA structure)
- `designs/TEAM_MANAGER_SPEC.md` — Full UI spec (informs what the foundation must support)

### Technology stack
- `CLAUDE.md` §Technology Stack — All gem/npm versions, compatibility matrix, what NOT to use

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. `source/dashboard/` contains only `.keep`.

### Established Patterns
- Docker compose pattern: arm64v8 images, named volumes, port mapping convention (non-standard ports like 5411 to avoid conflicts)
- README conventions: env.sample files for credentials, `bin/dev` for server startup, yarn for JS package management

### Integration Points
- `setup/Dockerfile-local-services.yml` — Rails database.yml must match port 5411 and credentials
- `.env.development` / `.env.test.local` — Referenced by README but don't exist yet; must be created

</code_context>

<specifics>
## Specific Ideas

- User explicitly prefers request specs over controller specs for API testing
- README already documents the full local setup flow — new Rails app should follow the same conventions (env files, Docker compose, `bin/dev`)

</specifics>

<deferred>
## Deferred Ideas

None — analysis stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-25 via assumptions mode*
