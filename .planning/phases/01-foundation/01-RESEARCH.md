# Phase 1: Foundation - Research

**Researched:** 2026-03-25
**Domain:** Rails 8 + React 19 application scaffolding, PostgreSQL, Devise auth, Vite, Tailwind v4, test framework
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield scaffolding phase: generate a Rails 8 app in `source/dashboard`, wire it to the existing Docker PostgreSQL, configure Devise for session-based auth, set up Vite + React + TypeScript + Tailwind v4 as the frontend pipeline, and establish the RSpec/RuboCop/Playwright test framework. No UI screens are built -- just the working foundation.

All 25 implementation decisions (D-01 through D-25) are locked in CONTEXT.md. The research below validates each decision against current library versions and documents the exact commands, configurations, and pitfalls the planner needs.

**Primary recommendation:** Execute in strict dependency order -- Rails generation first, then database, then Devise, then Vite/React/Tailwind, then test framework, then dev server wiring. Each layer depends on the previous.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Generate with `rails new source/dashboard --skip-javascript --database=postgresql` (full mode, NOT `--api`). Full mode is required for Devise session-based authentication (cookie middleware) and ActionCable (used in later phases).
- **D-02:** Add vite_rails after generation -- `--skip-javascript` prevents Rails from adding importmap/esbuild which vite_rails replaces.
- **D-03:** PostgreSQL UUID primary keys configured globally via `config.generators { |g| g.orm :active_record, primary_key_type: :uuid }` -- all models get UUID by default.
- **D-04:** Connect to existing Docker PostgreSQL on port 5411 with credentials from `setup/Dockerfile-local-services.yml` (user: `openclaw-team-manager`, password: `openclaw-team-manager-password`, trust auth).
- **D-05:** Create `env.sample.development` and `env.sample.test` files with database connection strings. Add `.env.development` and `.env.test.local` to `.gitignore`.
- **D-06:** Use `structure.sql` format (`config.active_record.schema_format = :sql`) per README's `schema_dump` reference requiring matching `pg_dump` version.
- **D-07:** Rails `~> 8.0.5` (confirmed available on RubyGems, released 2026-03-24). Stay on 8.0.x -- do not use 8.1.x.
- **D-08:** Devise `~> 5.0.3` (confirmed available, released 2026-03-16). Rails 8 support included.
- **D-09:** vite_rails `~> 3.10` (3.10.0 is current -- NOT 3.0.17 from stale CLAUDE.md Sources citation).
- **D-10:** Use `annotaterb ~> 4.22` for model annotations (FOUN-09). The original `annotate` gem is incompatible with Rails 8 (`activerecord < 8.0` constraint, last release 2022).
- **D-11:** solid_cable `~> 3.0`, rack-cors `~> 2.0`, pundit `~> 2.4`, pg_search `~> 2.3`, pagy `~> 9.x`, jbuilder `~> 3.0` per CLAUDE.md stack.
- **D-12:** vite_rails 3.10.0 manages Vite version -- do NOT install Vite separately or upgrade beyond what vite_rails pins.
- **D-13:** React 19.2 with TypeScript 5.7.x. Use `.tsx` files. Install `@types/react` and `@types/react-dom`.
- **D-14:** Tailwind CSS v4.2.2 via `@tailwindcss/vite` plugin (NOT PostCSS). CSS-first configuration with `@theme` block.
- **D-15:** Rails serves SPA from a root controller action (e.g., `pages#app` or `root#index`) with Vite tag helpers (`vite_javascript_tag`, `vite_stylesheet_tag`).
- **D-16:** Use yarn as package manager (per README conventions).
- **D-17:** RSpec with request specs only for API testing -- NO controller specs. Model specs for unit testing.
- **D-18:** rspec-rails `~> 8.0.4`, factory_bot_rails `~> 6.5.1`, faker `~> 3.6.1`.
- **D-19:** RuboCop `~> 1.85` with rubocop-rails and rubocop-rspec extensions.
- **D-20:** cypress-on-rails `~> 1.17` with `--framework playwright` flag. @playwright/test `^1.52.x`.
- **D-21:** Phase 1 success requires at least one passing model spec and one passing request spec. Playwright E2E is configured but a passing E2E test is not required until Phase 3.
- **D-22:** `bin/dev` uses Procfile.dev with foreman (system gem, not in Gemfile) to run Rails server + Vite dev server together.
- **D-23:** Rails on port 3000, Vite dev server on port 3036 (vite_rails default).
- **D-24:** Devise configured with session-based auth. User model with email/password. No signup routes -- user created via `rails console` only.
- **D-25:** Seed a default admin user in `seeds.rb` for development convenience.

### Claude's Discretion
- Loading skeleton and error state design choices
- Exact RuboCop rule configuration beyond defaults
- Compression/optimization settings for Vite
- Temp file and log handling conventions

### Deferred Ideas (OUT OF SCOPE)
None -- analysis stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUN-01 | Rails app scaffolded in `source/dashboard` using Rails generators and commands | D-01, D-02, D-07 -- `rails new` with specific flags, Rails 8.0.5 confirmed on RubyGems |
| FOUN-02 | PostgreSQL configured with UUID as primary key for all models | D-03, D-04, D-06 -- UUID generator config, pgcrypto extension, structure.sql format |
| FOUN-03 | Devise authentication with session-based login (user created via console) | D-08, D-24, D-25 -- Devise 5.0.3 confirmed, skip :registrations, seed user |
| FOUN-04 | vite_rails serving React frontend with Tailwind v4 CSS-first config | D-09, D-12, D-13, D-14, D-15 -- vite_rails 3.10, React 19.2, Tailwind v4 @tailwindcss/vite |
| FOUN-05 | `bin/dev` runs Rails server + Vite dev server together (Procfile.dev) | D-22, D-23 -- foreman 0.90.0 installed, Procfile.dev pattern |
| FOUN-06 | Docker-based PostgreSQL via `setup/Dockerfile-local-services.yml` | D-04 -- Docker compose file exists, container not running (needs start) |
| FOUN-07 | RSpec + Factory Bot + Faker test framework configured | D-17, D-18, D-21 -- rspec-rails 8.0.4, factory_bot_rails 6.5.1, faker 3.6.1 confirmed |
| FOUN-08 | RuboCop linting configured | D-19 -- rubocop 1.86.0 latest, rubocop-rails 2.34.3, rubocop-rspec 3.9.0 |
| FOUN-09 | Annotate gem configured for model schema annotations | D-10 -- annotaterb 4.22.0 confirmed, Rails 8 compatible |
| FOUN-10 | Playwright with cypress-on-rails for integration testing | D-20 -- cypress-on-rails latest is 1.20.0 (not 1.17), Playwright support confirmed |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **App location:** Rails app MUST live in `source/dashboard`
- **Tech stack:** Ruby 3.3.3, Rails, React, PostgreSQL 17, Vite, Tailwind CSS
- **Auth:** Devise -- simple email/password, user created via console
- **Assets:** vite_rails for React, Tailwind for styling
- **Dev server:** `bin/dev` must run both Rails and Vite
- **Serialization:** jbuilder for JSON responses
- **Testing:** RSpec, Factory Bot, Faker, Playwright with cypress-on-rails, RuboCop
- **Database:** PostgreSQL in Docker via `setup/` scripts
- **No axios** -- use native fetch + React Query
- **No Redis** -- Solid Cable uses PostgreSQL
- **No Webpacker/Shakapacker** -- Vite replaces them
- **No styled-components/CSS modules** -- Tailwind only
- **No active_model_serializers** -- jbuilder only

## Standard Stack

### Core (Verified Against RubyGems/npm 2026-03-25)

| Library | Version Spec | Latest Available | Purpose |
|---------|-------------|-----------------|---------|
| rails | `~> 8.0.5` | 8.0.5 | Backend framework |
| devise | `~> 5.0.3` | 5.0.3 | Session-based authentication |
| vite_rails | `~> 3.10` | 3.10.0 | Rails + Vite integration |
| jbuilder | `~> 2.14` | 2.14.1 | JSON serialization (see CORRECTION below) |
| solid_cable | `~> 3.0` | 3.0.12 | DB-backed ActionCable adapter |
| rack-cors | `~> 2.0` | 2.0.2 (v3.0.0 also available) | CORS middleware |
| pundit | `~> 2.4` | 2.5.2 | Authorization policies |
| pg_search | `~> 2.3` | 2.3.7 | PostgreSQL full-text search |
| pagy | `~> 9.0` | 9.4.0 (note: v43.x is latest major) | Pagination |
| annotaterb | `~> 4.22` | 4.22.0 | Model schema annotations |
| rspec-rails | `~> 8.0` | 8.0.4 | Test framework |
| factory_bot_rails | `~> 6.5` | 6.5.1 | Test data factories |
| faker | `~> 3.6` | 3.6.1 | Fake data generation |
| rubocop | `~> 1.85` | 1.86.0 | Ruby linting |
| rubocop-rails | `~> 2.34` | 2.34.3 | Rails-specific linting |
| rubocop-rspec | `~> 3.9` | 3.9.0 | RSpec-specific linting |
| cypress-on-rails | `~> 1.17` | 1.20.0 | E2E bridge for Playwright |
| pg | (Rails default) | latest | PostgreSQL adapter |

**CORRECTION -- jbuilder version:** CLAUDE.md states `jbuilder ~> 3.0` but jbuilder 3.0 DOES NOT EXIST. The latest version is 2.14.1. The claim "jbuilder 3.0 ships with Rails 8 -- 30% faster JSON rendering" in CLAUDE.md is factually incorrect. Use `gem 'jbuilder', '~> 2.14'` instead. Rails 8 ships with jbuilder ~> 2.x. This is a documentation error in CLAUDE.md, not a real constraint.

**CORRECTION -- rack-cors version:** CLAUDE.md says `~> 2.0`. rack-cors 3.0.0 exists and requires Rack >= 3.0.14. Rails 8 ships with Rack 3.x, so rack-cors 3.0.0 is compatible. However, `~> 2.0` from CLAUDE.md is the locked spec -- use that. It resolves to 2.0.2 which also works fine with Rails 8.

**NOTE -- pagy version:** CLAUDE.md says `~> 9.x`. pagy jumped from 9.x to 43.x. The `~> 9.0` constraint pins to 9.4.0 (latest in the 9.x series). This is fine for Phase 1 -- pagy is not used until later phases anyway.

**NOTE -- cypress-on-rails version:** CONTEXT.md says `~> 1.17` but the latest is 1.20.0. The `~> 1.17` constraint will resolve to 1.20.0 (semver allows minor bumps). The gem has been renamed to `cypress-playwright-on-rails` on GitHub but the RubyGems name remains `cypress-on-rails`.

### Frontend (npm packages)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.4 | UI library |
| react-dom | ^19.2.4 | DOM renderer |
| typescript | ^5.7.x | Type safety |
| @types/react | ^19.x | React type definitions |
| @types/react-dom | ^19.x | React DOM type definitions |
| @tailwindcss/vite | ^4.2.2 | Tailwind CSS Vite plugin |
| @playwright/test | ^1.52.x | E2E testing (configured but not actively tested in Phase 1) |

**NOTE:** vite_rails manages the Vite npm package version. Do NOT install `vite` separately.

### Installation Commands

```bash
# In source/dashboard after rails new:
# Gemfile additions -- see Architecture Patterns for exact Gemfile content

bundle install

# Frontend packages (from source/dashboard)
yarn add react react-dom
yarn add -D typescript @types/react @types/react-dom @tailwindcss/vite @playwright/test
```

## Architecture Patterns

### Recommended Project Structure (after Phase 1)

```
source/dashboard/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   └── pages_controller.rb          # Root SPA controller
│   ├── frontend/                         # vite_rails default frontend dir
│   │   ├── entrypoints/
│   │   │   └── application.tsx           # React mount point
│   │   ├── components/
│   │   │   └── App.tsx                   # Root React component
│   │   └── styles/
│   │       └── application.css           # Tailwind v4 with @theme
│   ├── models/
│   │   ├── application_record.rb
│   │   └── user.rb                       # Devise user model (UUID PK)
│   └── views/
│       ├── layouts/
│       │   └── application.html.erb      # Vite tag helpers
│       └── pages/
│           └── app.html.erb              # SPA mount point (<div id="root">)
├── config/
│   ├── database.yml                      # PG on port 5411
│   ├── cable.yml                         # Solid Cable config
│   ├── initializers/
│   │   ├── devise.rb                     # Devise config
│   │   └── generators.rb                 # UUID primary key config
│   ├── routes.rb                         # Devise routes + root
│   └── vite.json                         # vite_rails config
├── db/
│   └── structure.sql                     # SQL format schema dump
├── e2e/                                  # Playwright tests (cypress-on-rails)
├── spec/
│   ├── models/
│   │   └── user_spec.rb                  # At least one model spec
│   ├── requests/
│   │   └── health_check_spec.rb          # At least one request spec
│   ├── factories/
│   │   └── users.rb                      # User factory
│   ├── rails_helper.rb
│   └── spec_helper.rb
├── vite.config.mts                       # Vite config with @tailwindcss/vite
├── tsconfig.json                         # TypeScript config
├── Procfile.dev                          # foreman process file
├── .rubocop.yml                          # RuboCop config
├── .annotaterb.yml                       # AnnotateRb config
└── package.json                          # yarn dependencies
```

### Pattern 1: Rails New Generation in Subdirectory

**What:** Generate Rails app inside `source/dashboard` from the project root.
**When:** First step of Phase 1.

```bash
# From project root
cd /Users/vel/development/vlss/et/openclaw-team-manager

# Generate Rails app in source/dashboard
# NOTE: source/dashboard/.keep must be removed first or rails new will refuse
rm source/dashboard/.keep
rails new source/dashboard --skip-javascript --database=postgresql --skip-git

# --skip-git prevents nested .git directory (project root has git)
# --skip-javascript prevents importmap (vite_rails replaces it)
# --database=postgresql sets up pg adapter
# Full mode (no --api) required for Devise session cookies and ActionCable
```

**CRITICAL -- `--skip-git` flag:** The `rails new` command will create a nested `.git` directory and `.gitignore` inside `source/dashboard` by default. Since the project root already has git, use `--skip-git` to prevent this. The project-level `.gitignore` will handle ignoring files.

**CRITICAL -- Ruby version:** The current shell has Ruby 3.3.4 active but the project specifies Ruby 3.3.3. Use `rvm use 3.3.3` before generating the app. Create a `.ruby-version` file in the project root (or `source/dashboard/`) with content `3.3.3`.

**CRITICAL -- Rails version:** The locally installed `rails` gem is 8.0.4.1. To generate with Rails 8.0.5, either: (a) install Rails 8.0.5 first with `gem install rails -v 8.0.5`, or (b) generate with whatever is installed, then pin `~> 8.0.5` in the Gemfile and `bundle update rails`.

### Pattern 2: Database Configuration for Docker PostgreSQL

**What:** Configure database.yml to connect to Docker PostgreSQL on non-standard port.
**When:** After rails new, before db:create.

```yaml
# config/database.yml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  host: <%= ENV.fetch("DATABASE_HOST", "localhost") %>
  port: <%= ENV.fetch("DATABASE_PORT", "5411") %>
  username: <%= ENV.fetch("DATABASE_USER", "openclaw-team-manager") %>
  password: <%= ENV.fetch("DATABASE_PASSWORD", "openclaw-team-manager-password") %>

development:
  <<: *default
  database: openclaw_team_manager_development

test:
  <<: *default
  database: openclaw_team_manager_test

production:
  <<: *default
  database: openclaw_team_manager_production
```

```bash
# env.sample.development
DATABASE_HOST=localhost
DATABASE_PORT=5411
DATABASE_USER=openclaw-team-manager
DATABASE_PASSWORD=openclaw-team-manager-password
```

### Pattern 3: UUID Primary Keys Globally

**What:** Configure all models to use UUID primary keys by default.
**When:** Before generating any models.

```ruby
# config/initializers/generators.rb
Rails.application.config.generators do |g|
  g.orm :active_record, primary_key_type: :uuid
end
```

```ruby
# A migration to enable pgcrypto (required for gen_random_uuid())
# db/migrate/TIMESTAMP_enable_pgcrypto.rb
class EnablePgcrypto < ActiveRecord::Migration[8.0]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")
  end
end
```

**Foreign keys:** When adding references/belongs_to in migrations, use `type: :uuid`:
```ruby
add_reference :tasks, :agent, type: :uuid, foreign_key: true
```

### Pattern 4: Devise Without Registration Routes

**What:** Configure Devise for login-only (no signup).
**When:** After installing Devise.

```ruby
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users, skip: [:registrations]
  root "pages#app"
end
```

```ruby
# app/models/user.rb
class User < ApplicationRecord
  devise :database_authenticatable, :rememberable, :validatable
  # Removed :registerable -- users created via console only
end
```

```ruby
# db/seeds.rb
User.find_or_create_by!(email: "admin@openclaw.local") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
end
```

### Pattern 5: Vite + React + Tailwind v4 Setup

**What:** Wire vite_rails with React, TypeScript, and Tailwind CSS v4.
**When:** After bundle install with vite_rails.

```typescript
// vite.config.mts
import { defineConfig } from "vite";
import ViteRails from "vite-plugin-rails";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    ViteRails(),
    tailwindcss(),
  ],
});
```

```css
/* app/frontend/styles/application.css */
@import "tailwindcss";

@theme {
  --color-background: #0f1219;
  --color-surface: #1a1f2e;
  --color-accent: #00d4aa;
}
```

```tsx
// app/frontend/entrypoints/application.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "../components/App";
import "../styles/application.css";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
});
```

```tsx
// app/frontend/components/App.tsx
import React from "react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center">
      <h1 className="text-2xl font-bold text-accent">
        OpenClaw Team Manager
      </h1>
    </div>
  );
};

export default App;
```

```erb
<%# app/views/layouts/application.html.erb %>
<!DOCTYPE html>
<html>
  <head>
    <title>OpenClaw Team Manager</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    <%= vite_stylesheet_tag "application", media: "all" %>
  </head>
  <body>
    <%= yield %>
    <%= vite_javascript_tag "application" %>
  </body>
</html>
```

```erb
<%# app/views/pages/app.html.erb %>
<div id="root"></div>
```

### Pattern 6: Procfile.dev for bin/dev

**What:** Configure foreman to run Rails + Vite together.
**When:** After vite_rails install.

```
# Procfile.dev
web: bin/rails server -p 3000
vite: bin/vite dev
```

```bash
# bin/dev (should already exist from rails new, but verify)
#!/usr/bin/env sh
if ! gem list foreman -i --silent; then
  echo "Installing foreman..."
  gem install foreman
fi
exec foreman start -f Procfile.dev "$@"
```

### Pattern 7: Propshaft Coexistence

**What:** Rails 8 ships with Propshaft by default. vite_rails handles all JS/CSS assets.
**When:** After rails new, decide whether to keep or remove Propshaft.

**Recommendation:** Keep Propshaft in the Gemfile. It handles non-JS/CSS assets (images, fonts) that Devise or other gems may reference. Removing it can cause issues with gems that expect an asset pipeline. vite_rails and Propshaft coexist without conflict -- Propshaft serves static assets, Vite serves JS/CSS.

### Anti-Patterns to Avoid

- **DO NOT use `--api` mode for rails new:** Devise requires session/cookie middleware only available in full mode.
- **DO NOT install Vite npm package separately:** vite_rails controls the Vite version via vite_ruby dependency.
- **DO NOT use PostCSS for Tailwind v4:** v4 requires `@tailwindcss/vite` plugin, not the PostCSS plugin.
- **DO NOT create a nested .git:** Use `--skip-git` flag with `rails new`.
- **DO NOT use `schema.rb`:** Decision D-06 requires `structure.sql` format for pg_dump compatibility.
- **DO NOT add importmap-rails:** `--skip-javascript` prevents this; vite_rails replaces it.
- **DO NOT use controller specs:** Decision D-17 requires request specs for API testing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Authentication | Custom login/session management | Devise 5.0.3 | Handles password hashing, session management, CSRF, remember-me, and security edge cases |
| UUID generation | Manual UUID assignment in models | pgcrypto + Rails generator config | PostgreSQL's gen_random_uuid() is faster and more reliable than Ruby-side UUID generation |
| Asset pipeline | Custom Webpack/esbuild config | vite_rails 3.10 | Handles HMR, production builds, fingerprinting, Rails integration automatically |
| Process management | Custom shell scripts for multi-process | foreman + Procfile.dev | Standard Rails pattern, handles signal forwarding, log prefixing |
| Schema annotations | Manual comments in model files | annotaterb 4.22 | Auto-updates on migration, consistent format across all models |

## Common Pitfalls

### Pitfall 1: Rails New in Existing Directory with .keep File
**What goes wrong:** `rails new source/dashboard` may fail or behave unexpectedly when the directory already exists with a `.keep` file.
**Why it happens:** `rails new` expects either an empty or non-existent target directory.
**How to avoid:** Remove `source/dashboard/.keep` before running `rails new`. The `rails new` command will recreate the directory structure.
**Warning signs:** Error messages about existing files, or `rails new` running in "skip" mode for everything.

### Pitfall 2: Ruby Version Mismatch
**What goes wrong:** Gemfile.lock records Ruby 3.3.4 instead of 3.3.3, causing version mismatch errors.
**Why it happens:** The current shell has Ruby 3.3.4 active (via rvm default) instead of 3.3.3.
**How to avoid:** Run `rvm use 3.3.3` before `rails new` and all subsequent `bundle` commands. Create `.ruby-version` file with `3.3.3`.
**Warning signs:** `Your Ruby version is 3.3.4, but your Gemfile specified 3.3.3`

### Pitfall 3: PostgreSQL Docker Container Not Running
**What goes wrong:** `rails db:create` fails with connection refused.
**Why it happens:** The Docker container `openclaw-team-manager-psql` is not running. It must be started explicitly.
**How to avoid:** Start the container before any database operations: `docker-compose -p openclaw-team-manager -f setup/Dockerfile-local-services.yml up -d`
**Warning signs:** `PG::ConnectionBad: could not connect to server: Connection refused`

### Pitfall 4: pgcrypto Extension Not Enabled Before UUID Migration
**What goes wrong:** Devise migration (or any migration using UUID) fails with `function gen_random_uuid() does not exist`.
**Why it happens:** PostgreSQL needs the `pgcrypto` extension enabled to generate UUIDs. Rails does not enable it automatically.
**How to avoid:** Create a migration to enable pgcrypto BEFORE the Devise migration. Run it first.
**Warning signs:** `PG::UndefinedFunction: ERROR: function gen_random_uuid() does not exist`

### Pitfall 5: structure.sql Requires Matching pg_dump Version
**What goes wrong:** `rails db:migrate` produces warnings or errors about pg_dump version mismatch.
**Why it happens:** The `schema_format = :sql` setting uses the local `pg_dump` binary, which must match the PostgreSQL server version.
**How to avoid:** Verified: local `pg_dump` is version 17.5, Docker PostgreSQL is 17.5. They match. If they ever diverge, `brew install postgresql@17 && brew link postgresql@17 --force`.
**Warning signs:** `pg_dump: server version mismatch`

### Pitfall 6: Devise 5.0 + Turbo Stream Format
**What goes wrong:** Devise redirects fail or produce 406 errors after login.
**Why it happens:** Rails 8 uses Turbo by default, but we're using React SPA (no Turbo). Devise 5.0 may try to respond with turbo_stream format.
**How to avoid:** Since we're NOT using Turbo (React SPA), remove `turbo-rails` from the Gemfile if present. Devise will fall back to standard HTML responses for the login form. The React SPA will handle routing after login.
**Warning signs:** 406 Not Acceptable errors on login, or unexpected redirect behavior.

### Pitfall 7: vite_rails Entrypoint Location
**What goes wrong:** Vite doesn't find the entrypoint file, React doesn't load.
**Why it happens:** vite_rails expects entrypoints in `app/frontend/entrypoints/` by default (configured in `config/vite.json`).
**How to avoid:** Place `application.tsx` in `app/frontend/entrypoints/`. Verify `config/vite.json` has `sourceCodeDir: "app/frontend"` and `entrypointsDir: "entrypoints"`.
**Warning signs:** Browser console shows 404 for JavaScript files, blank page.

### Pitfall 8: Tailwind v4 CSS Import Syntax
**What goes wrong:** Tailwind classes don't apply, no utility CSS generated.
**Why it happens:** Tailwind v4 uses `@import "tailwindcss"` instead of v3's `@tailwind base; @tailwind components; @tailwind utilities;` directives.
**How to avoid:** Use `@import "tailwindcss";` as the first line in the CSS file. Use `@custom-variant dark (&:where(.dark, .dark *));` if dark mode class-based toggling is needed (not needed for this project since it's dark-only).
**Warning signs:** Tailwind utility classes have no effect, no styles in browser devtools.

### Pitfall 9: CORS Not Needed in Development with vite_rails
**What goes wrong:** CORS errors when React tries to call Rails API.
**Why it happens:** Misunderstanding -- vite_rails proxies API requests through Vite dev server to Rails, so they're same-origin.
**How to avoid:** vite_rails handles this automatically. CORS is only needed if the React app is served from a truly different origin. For local dev with `bin/dev`, both servers appear as localhost:3000 to the browser. rack-cors is needed for production or if you access the API directly on port 3000 from a different port.
**Warning signs:** This is actually a non-issue with vite_rails, but add rack-cors anyway for later phases.

### Pitfall 10: Rails 8 Solid Trifecta Defaults
**What goes wrong:** Rails 8 generates Solid Queue, Solid Cache, and Solid Cable configurations by default, creating extra database configs and migrations.
**Why it happens:** Rails 8 includes these by default for new apps.
**How to avoid:** We WANT Solid Cable (D-11), but do NOT need Solid Queue or Solid Cache for Phase 1. After `rails new`, review the generated `config/database.yml` -- it may have separate database entries for `queue` and `cache`. Remove those if present. Keep the `cable` database entry or configure it to use the primary database. For simplicity, Solid Cable can share the primary PostgreSQL database -- copy the cable schema migration into a regular migration.
**Warning signs:** Extra databases being created, confusing multi-database configuration.

## Code Examples

### Gemfile Additions (beyond Rails defaults)

```ruby
# source/dashboard/Gemfile -- add these to the generated Gemfile

# Authentication
gem "devise", "~> 5.0"

# JSON Serialization (should already be present in Rails 8 default Gemfile)
# gem "jbuilder" -- verify it's already there, Rails 8 includes it

# Real-time (Solid Cable should already be in Rails 8 default)
# gem "solid_cable" -- verify it's already there

# API
gem "rack-cors", "~> 2.0"

# Authorization
gem "pundit", "~> 2.4"

# Search
gem "pg_search", "~> 2.3"

# Pagination
gem "pagy", "~> 9.0"

# Frontend
gem "vite_rails", "~> 3.10"

# Annotations
gem "annotaterb", "~> 4.22"

group :development, :test do
  gem "rspec-rails", "~> 8.0"
  gem "factory_bot_rails", "~> 6.5"
  gem "faker", "~> 3.6"
  gem "rubocop", "~> 1.85", require: false
  gem "rubocop-rails", "~> 2.34", require: false
  gem "rubocop-rspec", "~> 3.9", require: false
end

group :test do
  gem "cypress-on-rails", "~> 1.17"
end
```

### TypeScript Configuration

```json
// source/dashboard/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["app/frontend/*"]
    }
  },
  "include": ["app/frontend/**/*"],
  "exclude": ["node_modules"]
}
```

### RuboCop Configuration

```yaml
# source/dashboard/.rubocop.yml
require:
  - rubocop-rails
  - rubocop-rspec

AllCops:
  NewCops: enable
  TargetRubyVersion: 3.3
  Exclude:
    - "bin/**/*"
    - "db/**/*"
    - "config/**/*"
    - "node_modules/**/*"
    - "vendor/**/*"
    - "tmp/**/*"

Style/Documentation:
  Enabled: false

Style/FrozenStringLiteralComment:
  EnforcedStyle: always

Metrics/BlockLength:
  Exclude:
    - "spec/**/*"
    - "config/routes.rb"
    - "config/environments/**/*"

RSpec/ExampleLength:
  Max: 20

RSpec/MultipleExpectations:
  Max: 5
```

### Minimal User Model Spec

```ruby
# spec/models/user_spec.rb
require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  describe "validations" do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
  end

  describe "UUID primary key" do
    it "uses UUID for id" do
      created_user = create(:user)
      expect(created_user.id).to match(/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/)
    end
  end
end
```

### Minimal Request Spec

```ruby
# spec/requests/health_check_spec.rb
require "rails_helper"

RSpec.describe "Health Check", type: :request do
  describe "GET /up" do
    it "returns success" do
      get rails_health_check_path
      expect(response).to have_http_status(:ok)
    end
  end
end
```

### User Factory

```ruby
# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { "password123" }
    password_confirmation { "password123" }
  end
end
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sprockets | Propshaft (Rails 8 default) | Rails 8.0 (Nov 2024) | Propshaft is simpler but we use vite_rails for JS/CSS |
| importmap-rails | vite_rails (for React SPA) | Project decision | importmap doesn't support JSX/TSX |
| Redis for ActionCable | Solid Cable (PG-backed) | Rails 8.0 (Nov 2024) | No Redis dependency |
| annotate gem | annotaterb | 2023-2024 | Original annotate incompatible with Rails 8 |
| Tailwind v3 config.js | Tailwind v4 CSS-first @theme | Tailwind v4 (Jan 2025) | No more tailwind.config.js |
| Tailwind PostCSS plugin | @tailwindcss/vite | Tailwind v4 (Jan 2025) | Must use Vite plugin, not PostCSS |
| react-router-dom | react-router (v7) | React Router v7 (2025) | Single package, no more react-router-dom |
| schema.rb | structure.sql | Project decision (D-06) | SQL format needed for pg_dump version matching |

## Open Questions

1. **Solid Cable single vs. separate database**
   - What we know: Rails 8 generates Solid Cable with a separate `cable` database by default. For a local single-machine dashboard, sharing the primary database is simpler.
   - What's unclear: Whether `rails new` with `--database=postgresql` auto-configures Solid Cable's database.yml correctly for PG, or defaults to SQLite for cable.
   - Recommendation: After `rails new`, inspect `config/database.yml`. If it has a separate cable database config, either keep it (works fine) or merge it into primary (simpler). Copy `db/cable_schema.rb` content into a normal migration if merging.

2. **Turbo-rails removal**
   - What we know: Rails 8 full mode includes turbo-rails by default. We're building a React SPA (no Turbo).
   - What's unclear: Whether removing turbo-rails causes any issues with Devise 5.0 or other Rails defaults.
   - Recommendation: Remove `turbo-rails` and `stimulus-rails` from Gemfile since the React SPA doesn't use them. Test Devise login flow after removal to ensure no format negotiation issues.

3. **Devise views for React SPA**
   - What we know: Devise generates ERB views for login/registration. We need login to work before the React SPA loads.
   - What's unclear: Whether to use Devise's default ERB login view or build a React-based login.
   - Recommendation: For Phase 1, use Devise's default ERB login form (it works out of the box). In later phases, the React SPA can have its own login form that POSTs to Devise's session controller. This keeps Phase 1 simple.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Ruby | Runtime | Yes (via rvm) | 3.3.3 (x86_64), 3.3.4 (current default) | Switch with `rvm use 3.3.3` |
| Rails gem | App generation | Partially | 8.0.4.1 (installed), 8.0.5 (on RubyGems) | `gem install rails -v 8.0.5` |
| Node.js | Vite/frontend | Yes | v22.15.0 | -- |
| yarn | Package manager | Yes | 1.22.22 | -- |
| PostgreSQL (Docker) | Database | Container exists but NOT running | 17.5 (image) | Start with docker-compose command |
| pg_dump | structure.sql | Yes | 17.5 (Homebrew) | -- |
| Docker | PostgreSQL hosting | Yes | 29.1.3 | -- |
| foreman | Process management | Yes (system gem) | 0.90.0 | -- |
| Devise gem | Auth | Not installed locally | 5.0.3 (on RubyGems) | Install via Gemfile |

**Missing dependencies with no fallback:**
- Rails 8.0.5 must be installed: `gem install rails -v 8.0.5`

**Missing dependencies with fallback:**
- PostgreSQL Docker container not running: `docker-compose -p openclaw-team-manager -f setup/Dockerfile-local-services.yml up -d`
- Ruby 3.3.3 not active in shell: `rvm use 3.3.3` (3.3.3 IS installed, just not selected)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.4 + rspec-rails |
| Config file | None yet -- Wave 0 must run `rails generate rspec:install` |
| Quick run command | `cd source/dashboard && bundle exec rspec --fail-fast` |
| Full suite command | `cd source/dashboard && bundle exec rspec` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | Rails app boots successfully | smoke | `cd source/dashboard && bin/rails runner "puts 'OK'"` | N/A |
| FOUN-02 | UUID primary keys on User model | unit | `cd source/dashboard && bundle exec rspec spec/models/user_spec.rb -x` | Wave 0 |
| FOUN-03 | Devise login works with seeded user | request | `cd source/dashboard && bundle exec rspec spec/requests/sessions_spec.rb -x` | Wave 0 |
| FOUN-04 | Vite serves React frontend | smoke | `cd source/dashboard && bin/vite build` (builds without error) | N/A |
| FOUN-05 | bin/dev starts both servers | manual | Start `bin/dev`, verify localhost:3000 loads | manual-only |
| FOUN-06 | PostgreSQL connects via Docker | smoke | `cd source/dashboard && bin/rails db:version` | N/A |
| FOUN-07 | RSpec runs and passes | smoke | `cd source/dashboard && bundle exec rspec` | Wave 0 |
| FOUN-08 | RuboCop runs clean | lint | `cd source/dashboard && bundle exec rubocop` | N/A (.rubocop.yml in Wave 0) |
| FOUN-09 | AnnotateRb configured | smoke | `cd source/dashboard && bundle exec annotaterb models` | N/A |
| FOUN-10 | Playwright configured | smoke | `cd source/dashboard && ls e2e/` (directory exists) | N/A |

### Sampling Rate
- **Per task commit:** `cd source/dashboard && bundle exec rspec --fail-fast`
- **Per wave merge:** `cd source/dashboard && bundle exec rspec && bundle exec rubocop`
- **Phase gate:** Full RSpec suite green + RuboCop clean + `bin/dev` starts successfully

### Wave 0 Gaps
- [ ] `spec/models/user_spec.rb` -- covers FOUN-02, FOUN-03 (UUID + Devise)
- [ ] `spec/requests/health_check_spec.rb` -- covers FOUN-01, FOUN-07
- [ ] `spec/requests/sessions_spec.rb` -- covers FOUN-03 (login flow)
- [ ] `spec/factories/users.rb` -- shared factory for User model
- [ ] `spec/rails_helper.rb` -- generated by `rails generate rspec:install`
- [ ] `.rubocop.yml` -- covers FOUN-08
- [ ] RSpec install: `cd source/dashboard && rails generate rspec:install`

## Sources

### Primary (HIGH confidence)
- RubyGems registry -- direct `gem search` commands verified all gem versions (rails 8.0.5, devise 5.0.3, vite_rails 3.10.0, annotaterb 4.22.0, jbuilder 2.14.1 -- NOT 3.0)
- `setup/Dockerfile-local-services.yml` -- Docker PostgreSQL config (port 5411, arm64v8/postgres:17.5, trust auth)
- `README.md` -- Project conventions (env.sample files, yarn, bin/dev, pg_dump version matching)
- Local environment probing -- Ruby 3.3.3/3.3.4 via rvm, Node 22.15.0, yarn 1.22.22, pg_dump 17.5, foreman 0.90.0, Docker 29.1.3

### Secondary (MEDIUM confidence)
- [Vite Ruby official docs](https://vite-ruby.netlify.app/guide/rails.html) -- vite_rails setup, entrypoint conventions
- [Tailwind CSS v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, @tailwindcss/vite plugin
- [Rails 8.0 Release Notes](https://guides.rubyonrails.org/8_0_release_notes.html) -- Solid trifecta defaults, Propshaft
- [Devise GitHub](https://github.com/heartcombo/devise) -- Route skipping, Rails 8 support
- [AnnotateRb GitHub](https://github.com/drwl/annotaterb) -- Installation, .annotaterb.yml config
- [Setting Up Rails 8 with Vite and Tailwind CSS 4](https://medium.com/@yatishmehta/ruby-on-rails-8-vite-and-tailwind-v4-1ad62c4f6943) -- Integration guide
- [cypress-on-rails GitHub](https://github.com/shakacode/cypress-on-rails) -- Playwright framework flag

### Tertiary (LOW confidence)
- [UUID primary key Rails guide](https://danielabaron.me/blog/rails-uuid-primary-key-postgres/) -- pgcrypto extension requirement (verified against Rails docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against RubyGems and npm registries directly
- Architecture: HIGH -- patterns drawn from official docs and verified guides
- Pitfalls: HIGH -- based on known Rails 8 / Devise 5 / Tailwind v4 changes, verified against current docs

**Corrections to CLAUDE.md discovered during research:**
1. `jbuilder ~> 3.0` is WRONG -- jbuilder 3.0 does not exist. Latest is 2.14.1. Use `~> 2.14`.
2. `vite_rails 3.0.17` in Sources section is stale -- current is 3.10.0 (already noted in CONTEXT.md D-09).
3. `pagy ~> 9.x` -- pagy versioning jumped to 43.x. The `~> 9.0` constraint is still valid (pins to 9.4.0).

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable stack, no fast-moving components)
