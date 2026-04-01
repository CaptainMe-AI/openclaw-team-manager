# OpenClaw Team Manager

Local mission control dashboard for managing OpenClaw AI agents. Fleet management, task tracking, approval workflows, usage metrics, and configuration — all in a dark-mode, data-dense UI.

Rails app lives in `source/dashboard`.

## Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Backend  | Ruby 3.3.4, Rails 8.0.5, PostgreSQL 17    |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Auth     | Devise (email/password, console-created)  |
| Realtime | ActionCable + Solid Cable (no Redis)      |
| Testing  | RSpec, Factory Bot, Playwright            |

## Local Setup

### 1. Install Ruby

Use a Ruby version manager like [rvm](https://rvm.io/). The project requires Ruby `3.3.4` (see `.ruby-version`).

**Apple Silicon Macs:** you may need:
```sh
arch -x86_64 rvm install 3.3.4 --with-openssl-dir=/usr/local/opt/openssl@3
```

### 2. Start PostgreSQL via Docker

```sh
docker-compose -p openclaw-team-manager -f setup/Dockerfile-local-services.yml up -d
```

### 3. Configure environment files

```sh
cp env.sample.development source/dashboard/.env.development
cp env.sample.test source/dashboard/.env.test.local
```

Do **not** commit `.env.development` or `.env.test.local`.

### 4. Install dependencies

```sh
cd source/dashboard
bundle install
yarn install
```

### 5. Match local pg_dump to Docker PostgreSQL version

Rails uses `pg_dump` for schema dumps. The local version must match the Docker database version (17.x):

```sh
brew install postgresql@17
brew link postgresql@17 --force
pg_dump --version   # must be 17.x.x
```

> This may affect other projects. Re-link the version they need when switching back.

### 6. Set up the database

```sh
bundle exec rake db:setup
```

This creates both development and test databases and runs seeds.

### 7. Start the dev server

```sh
bin/dev
```

Runs Rails on `http://localhost:3000` and Vite on port `3036`.

### Seed data

Seeds create a default user and sample data:

| Data           | Count   | Notes                                   |
|----------------|---------|-----------------------------------------|
| User           | 1       | `admin@openclaw.local` / `password123`  |
| Agents         | 6       | active, idle, error, disabled           |
| Tasks          | ~35     | spread across all Kanban columns        |
| Approvals      | 12      | pending, approved, denied               |
| Usage records  | ~1,008  | 7 days of hourly data per agent         |
| Settings       | 12      | display, budget, notification, datasource |

## Testing

```sh
# Ruby specs
bundle exec rspec

# Linting
bundle exec rubocop

# E2E (Playwright)
npx playwright test
```

## Key Commands

| Command                         | What it does                          |
|---------------------------------|---------------------------------------|
| `bin/dev`                       | Start Rails + Vite dev servers        |
| `bundle exec rspec`             | Run backend tests                     |
| `bundle exec rubocop -A .`      | Lint and auto-correct Ruby files      |
| `bundle exec rake db:seed`      | Seed sample data                      |
| `bundle exec rake db:reset`     | Drop, recreate, migrate, and seed     |

## Connecting to OpenClaw

This dashboard runs on the same machine as OpenClaw and connects via the Gateway WebSocket and filesystem reads. See [OPENCLAW_SETUP.md](OPENCLAW_SETUP.md) for full setup instructions — Gateway configuration, directory structure, auth tokens, and data flow.

v1.0 ships with mock data and does not require a running OpenClaw installation.
