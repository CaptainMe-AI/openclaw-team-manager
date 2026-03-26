---
phase: 01-foundation
plan: 02
subsystem: auth, ui
tags: [devise, vite, react, typescript, tailwind-v4, authentication, dark-theme]

# Dependency graph
requires:
  - phase: 01-01
    provides: Rails 8.0.5 app with PostgreSQL, UUID primary keys, Gemfile with devise and vite_rails gems
provides:
  - Devise authentication with session-based login (no registration)
  - Dark-themed login page styled per UI-SPEC
  - Seeded admin user (admin@openclaw.local / password123)
  - Vite + React 19 + TypeScript frontend pipeline
  - Tailwind v4 CSS-first theme with 11 color tokens and 2 font families
  - Root React App component rendering after authentication
  - bin/dev running Rails (port 3000) and Vite (port 3036) together
affects: [01-03, 02-01, 02-02, 03-01, all-future-frontend]

# Tech tracking
tech-stack:
  added: [react 19, react-dom 19, typescript 5.x, @tailwindcss/vite, @playwright/test, vite-plugin-rails]
  patterns: [Devise login-only auth (skip registrations), Tailwind v4 @theme CSS-first config, Vite entrypoint via application.tsx, CSS loaded via TSX import not vite_stylesheet_tag]

key-files:
  created:
    - source/dashboard/app/models/user.rb
    - source/dashboard/app/controllers/pages_controller.rb
    - source/dashboard/app/views/devise/sessions/new.html.erb (overridden)
    - source/dashboard/app/views/layouts/devise.html.erb
    - source/dashboard/app/views/pages/app.html.erb
    - source/dashboard/app/frontend/entrypoints/application.tsx
    - source/dashboard/app/frontend/components/App.tsx
    - source/dashboard/app/frontend/styles/application.css
    - source/dashboard/vite.config.mts
    - source/dashboard/tsconfig.json
    - source/dashboard/Procfile.dev
    - source/dashboard/bin/vite
    - source/dashboard/config/vite.json
    - source/dashboard/config/initializers/devise.rb
    - source/dashboard/db/migrate/20260326015751_devise_create_users.rb
    - source/dashboard/db/seeds.rb
    - source/dashboard/spec/factories/users.rb
    - source/dashboard/spec/models/user_spec.rb
  modified:
    - source/dashboard/Gemfile
    - source/dashboard/Gemfile.lock
    - source/dashboard/package.json
    - source/dashboard/yarn.lock
    - source/dashboard/config/routes.rb
    - source/dashboard/app/controllers/application_controller.rb
    - source/dashboard/app/views/layouts/application.html.erb
    - source/dashboard/db/structure.sql
    - source/dashboard/.gitignore
    - .gitignore

key-decisions:
  - "CSS loaded via TSX entrypoint import, not vite_stylesheet_tag -- Tailwind v4 with @tailwindcss/vite plugin processes CSS through Vite pipeline"
  - "Devise sessions-only auth: skip registrations, users created via console per project constraint"
  - "Separate devise.html.erb layout for login page vs application.html.erb for authenticated SPA"
  - "@source directive added to Tailwind for ERB file scanning"

patterns-established:
  - "Auth pattern: Devise login-only with :database_authenticatable, :rememberable, :validatable"
  - "Layout pattern: devise layout for auth pages, application layout for SPA shell"
  - "Frontend pattern: Vite entrypoint at app/frontend/entrypoints/application.tsx imports CSS and renders React"
  - "Theme pattern: Tailwind v4 @theme block in application.css with CSS custom properties"
  - "Dev server pattern: bin/dev runs foreman with Procfile.dev (Rails + Vite)"

requirements-completed: [FOUN-03, FOUN-04, FOUN-05]

# Metrics
duration: ~15min
completed: 2026-03-26
---

# Phase 01 Plan 02: Auth + Frontend Pipeline Summary

**Devise session auth with dark-themed login, Vite + React 19 + TypeScript + Tailwind v4 frontend pipeline, bin/dev dual-server setup**

## Performance

- **Duration:** ~15 min (across 3 tasks including human verification checkpoint)
- **Started:** 2026-03-26T01:55:00Z
- **Completed:** 2026-03-26T02:34:01Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 33

## Accomplishments
- Devise authentication installed with login-only flow (no registration routes) and seeded admin user
- Dark-themed login page matching UI-SPEC: surface card, teal accent button, Inter font, proper color tokens
- Vite + React 19 + TypeScript + Tailwind v4 frontend pipeline fully wired and building
- Root React App component renders after authentication with dark background and accent-colored heading
- bin/dev starts both Rails (port 3000) and Vite dev server (port 3036) via foreman
- Tailwind v4 CSS-first configuration with all 11 color tokens and 2 font families

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Devise, create User model, configure auth, style login page** - `ad44be6` (feat)
2. **Task 2: Wire Vite + React + TypeScript + Tailwind v4 frontend pipeline and bin/dev** - `017f2a2` (feat)
3. **Task 3: Verify login flow and React rendering** - `7cde7d5` (fix, applied during verification)

**Plan metadata:** (this commit) (docs: complete plan)

## Files Created/Modified
- `source/dashboard/app/models/user.rb` - Devise user model with UUID primary key, login-only modules
- `source/dashboard/config/routes.rb` - Devise routes (skip registrations), root to pages#app
- `source/dashboard/config/initializers/devise.rb` - Devise configuration with navigational_formats fix
- `source/dashboard/db/migrate/*_devise_create_users.rb` - Users table with UUID PK and Devise columns
- `source/dashboard/db/seeds.rb` - Seeded admin user (admin@openclaw.local)
- `source/dashboard/app/views/devise/sessions/new.html.erb` - Dark-themed login form per UI-SPEC
- `source/dashboard/app/views/layouts/devise.html.erb` - Separate layout for Devise auth pages
- `source/dashboard/app/views/layouts/application.html.erb` - SPA layout with Vite tags and Google Fonts
- `source/dashboard/app/controllers/pages_controller.rb` - SPA root controller with authenticate_user!
- `source/dashboard/app/controllers/application_controller.rb` - Layout switching (devise vs application)
- `source/dashboard/app/views/pages/app.html.erb` - React mount point (div#root)
- `source/dashboard/app/frontend/entrypoints/application.tsx` - React entrypoint with CSS import
- `source/dashboard/app/frontend/components/App.tsx` - Root React component with dark theme placeholder
- `source/dashboard/app/frontend/styles/application.css` - Tailwind v4 @theme with all design tokens
- `source/dashboard/vite.config.mts` - Vite config with ViteRails and @tailwindcss/vite plugins
- `source/dashboard/tsconfig.json` - TypeScript config with react-jsx, path aliases
- `source/dashboard/package.json` - React, TypeScript, Tailwind dependencies
- `source/dashboard/Procfile.dev` - Foreman process definitions (web + vite)
- `source/dashboard/bin/dev` - Dev server launcher script
- `source/dashboard/bin/vite` - Vite CLI wrapper
- `source/dashboard/config/vite.json` - Vite-Rails configuration (ports, source paths)
- `source/dashboard/spec/factories/users.rb` - User factory for tests
- `source/dashboard/spec/models/user_spec.rb` - User model spec placeholder

## Decisions Made
- CSS loaded via TSX entrypoint import (`import "../styles/application.css"`) instead of `vite_stylesheet_tag` in layout -- Tailwind v4 with `@tailwindcss/vite` plugin processes CSS through the Vite pipeline, not as a standalone asset
- Devise configured with sessions-only auth (skip registrations) -- users created via console per project constraint D-24
- Separate `devise.html.erb` layout for login page keeps auth pages independent from the SPA application layout
- Added `@source` directive in Tailwind CSS to scan ERB files for class usage -- required for Tailwind v4 to detect utility classes in server-rendered templates

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ruby version 3.3.3 to 3.3.4**
- **Found during:** Task 1 (environment setup)
- **Issue:** System Ruby was 3.3.4, not 3.3.3 as specified in CLAUDE.md
- **Fix:** Used system Ruby 3.3.4 -- compatible minor patch version
- **Files modified:** None (runtime only)
- **Verification:** All gems installed and Rails booted successfully
- **Committed in:** ad44be6 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added Vite build output to .gitignore**
- **Found during:** Task 2 (Vite build verification)
- **Issue:** Vite build produces output in public/vite-dev/ and public/vite/ that should not be committed
- **Fix:** Added Vite build output directories to .gitignore
- **Files modified:** source/dashboard/.gitignore, .gitignore
- **Verification:** Build output no longer appears in git status
- **Committed in:** d3543e2 (between Task 1 and Task 2)

**3. [Rule 3 - Blocking] Switched npm to yarn per project convention**
- **Found during:** Task 2 (npm package installation)
- **Issue:** Project uses yarn (yarn.lock present from Rails generation), npm would create conflicting package-lock.json
- **Fix:** Used `yarn add` instead of `npm install` for all package installations
- **Files modified:** package.json, yarn.lock
- **Verification:** yarn.lock updated correctly, no package-lock.json created
- **Committed in:** 017f2a2 (Task 2 commit)

**4. [Rule 1 - Bug] Fixed Vite asset loading in layouts**
- **Found during:** Task 3 (human verification checkpoint)
- **Issue:** `vite_stylesheet_tag` caused double-loading of CSS and failed to resolve correctly; `vite_javascript_tag` path was wrong; Tailwind v4 needed `@source` directive to scan ERB files
- **Fix:** Removed `vite_stylesheet_tag` from both layouts (CSS loaded via TSX import), fixed `vite_javascript_tag` path to `"entrypoints/application.tsx"`, added `@source` directive for ERB scanning
- **Files modified:** source/dashboard/app/views/layouts/application.html.erb, source/dashboard/app/views/layouts/devise.html.erb, source/dashboard/app/frontend/styles/application.css
- **Verification:** Login page and React root both render with correct dark theme styling
- **Committed in:** 7cde7d5

---

**Total deviations:** 4 auto-fixed (1 bug, 1 missing critical, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correctness and compatibility. No scope creep.

## Issues Encountered
- Devise generated views under `app/views/users/` (model-scoped) rather than `app/views/devise/` -- this is standard Devise behavior when generating scoped views
- Vite stylesheet loading required investigation: Tailwind v4 with `@tailwindcss/vite` plugin processes CSS through the Vite JS pipeline, making `vite_stylesheet_tag` unnecessary and problematic

## User Setup Required

None - no external service configuration required. PostgreSQL runs in Docker, admin user seeded automatically.

## Next Phase Readiness
- Auth pipeline complete: login works, session persists, React renders after auth
- Frontend pipeline ready: Vite builds, React renders, Tailwind v4 tokens active
- Ready for Plan 03: RSpec, RuboCop, AnnotateRb, Playwright test framework setup
- Design tokens already established in application.css -- Phase 2 (Design System) can extend them

## Self-Check: PASSED

All 18 key files verified present. All 3 commit hashes (ad44be6, 017f2a2, 7cde7d5) confirmed in git log.

---
*Phase: 01-foundation*
*Completed: 2026-03-26*
