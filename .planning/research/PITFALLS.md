# Pitfalls Research

**Domain:** Real-time AI agent management dashboard (Rails API + React SPA with vite_rails)
**Researched:** 2026-03-25
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Mock Data Layer That Cannot Be Swapped Out

**What goes wrong:**
The mock data layer becomes structurally entangled with React components. Mocks return perfectly shaped, always-present data. Components are written assuming this perfection -- no loading states, no error boundaries, no partial data handling. When real Gateway WebSocket integration arrives, every component breaks because real data is messy: fields are null, events arrive out of order, connections drop, and payloads differ from what mocks assumed.

**Why it happens:**
Developers build mocks as static JSON objects or simple factory functions that return complete data every time. Components consume `mockAgents[0].currentTask.name` without null checks because the mock always has that data. There is no abstraction boundary between "where data comes from" and "how components render it." The mock is not a stand-in for a real service -- it is hardcoded convenience.

**How to avoid:**
1. Define a **data service interface** layer (TypeScript interfaces or a service class) that both mock and real implementations satisfy. Components import from the service, never from mock data directly.
2. Mock services must return data through the **same async patterns** the real implementation will use: Promises for REST, observable streams or callback subscriptions for WebSocket events. Never return synchronous static objects.
3. Mock services should simulate **realistic imperfections**: occasional nulls, empty arrays, delayed responses (even 50-100ms setTimeout), and error states. Use Faker or factory patterns with variability, not static fixtures.
4. Define the **API contract** (TypeScript types for all responses) in a shared location. Both mock service and future real service must satisfy these types.

**Warning signs:**
- Components have zero loading/skeleton states
- No TypeScript interfaces for API responses -- just inline object shapes
- Mock data lives inside component files or is imported directly as JSON
- Tests pass with mocks but there is no way to test with a different data source
- The word "mock" appears in component import paths

**Phase to address:**
Phase 1 (Scaffolding) -- establish the service layer pattern and TypeScript contracts before any screen is built. This is a foundational architecture decision that becomes exponentially more expensive to retrofit.

---

### Pitfall 2: Devise Session Auth Misaligned with React SPA

**What goes wrong:**
Devise is configured for traditional Rails server-rendered views (cookie-based sessions with CSRF tokens embedded in forms). The React SPA sends JSON API requests that either lack CSRF tokens (causing `ActionController::InvalidAuthenticityToken`) or cannot read session cookies because the SPA and API are on different origins or ports during development (Vite dev server on port 5173, Rails on port 3000). Developers waste days on authentication plumbing that "just works" in vanilla Rails.

**Why it happens:**
Devise's default configuration assumes server-rendered HTML forms. Rails' CSRF protection assumes the token is injected into a `<meta>` tag by `csrf_meta_tags` and read by Rails UJS. A React SPA served by Vite does not go through Rails view rendering for most interactions, so the CSRF mechanism breaks. Additionally, cookie `SameSite` policies block cross-origin cookies between ports.

**How to avoid:**
1. Since this is a **same-machine local app** (not a separate API deployment), use the **Rails-served SPA approach**: Rails serves the React app's `index.html` via a catch-all route. Vite handles asset compilation only. This keeps the SPA on the same origin as the API, so session cookies and CSRF tokens work naturally.
2. Configure Devise to respond to JSON format: override sessions controller to handle JSON login/logout and return user data as JSON.
3. Include CSRF token in the HTML shell (`csrf_meta_tags` in the Rails layout) and read it from the `<meta>` tag in your React API client (axios/fetch interceptor).
4. In development, configure vite_rails proxy correctly so API requests from the Vite dev server reach Rails without CORS issues. The `skipProxy` setting or Puma thread increase is critical.

**Warning signs:**
- 422 Unprocessable Entity on POST/PATCH/DELETE requests from React
- Login works in browser but fails from the React app
- Adding `skip_before_action :verify_authenticity_token` to controllers (this is a security hole, not a fix)
- CORS configuration being added for same-machine deployment (should not be needed)

**Phase to address:**
Phase 1 (Scaffolding) -- Devise + React auth flow must be proven end-to-end before building any authenticated screens.

---

### Pitfall 3: Rails Catch-All Route Conflicts with API Routes and Asset Serving

**What goes wrong:**
React Router requires all client-side routes (`/agents`, `/tasks`, `/approvals`, etc.) to be served by the same HTML entry point. A naive catch-all route (`get '*path', to: 'spa#index'`) in Rails swallows API routes (`/api/*`), Vite dev server assets (`/vite-dev/*`, `/@vite/*`), and ActionCable WebSocket connections (`/cable`). The app appears broken -- API calls return HTML instead of JSON, HMR stops working, and WebSockets fail to connect.

**Why it happens:**
Route ordering in Rails is first-match-wins. If the catch-all is defined too early, or without proper constraints, it intercepts everything. Developers add the catch-all, see React Router working, and do not notice that API endpoints are now broken until later.

**How to avoid:**
1. Define API routes **first**, then the catch-all **last** with explicit exclusions:
   ```ruby
   # config/routes.rb
   namespace :api do
     # all API routes here
   end

   # Devise routes
   devise_for :users

   # Catch-all for React SPA -- MUST be last
   get '*path', to: 'spa#index', constraints: ->(req) {
     !req.xhr? && req.format.html? && !req.path.start_with?('/api/', '/cable', '/vite-dev/', '/@')
   }
   root to: 'spa#index'
   ```
2. Use format constraints (`constraints: { format: :html }`) so JSON/JS requests are not caught.
3. Test route resolution explicitly: write a request spec that verifies `/api/agents.json` returns JSON, not HTML.

**Warning signs:**
- API endpoints intermittently return HTML responses
- Vite HMR stops working after adding SPA routing
- Browser console shows `Unexpected token '<'` errors (JSON parse failing on HTML)
- ActionCable connection failures after route changes

**Phase to address:**
Phase 1 (Scaffolding) -- establish route structure with both API namespace and SPA catch-all before any screen work begins.

---

### Pitfall 4: WebSocket Architecture Missing from Mock Phase

**What goes wrong:**
The mock phase builds everything with REST-style request/response patterns (fetch on mount, poll for updates). When real-time WebSocket integration arrives, the entire data flow must be rewritten. Components expect to "pull" data but WebSockets "push" data. State management was designed around request/response, not event streams. The mock-to-real transition becomes a rewrite, not a swap.

**Why it happens:**
"We will add WebSockets later" is treated as additive, but real-time data flow is fundamentally different from polling. If the state management and component patterns are not designed for push-based updates from the start, retrofitting is architectural surgery.

**How to avoid:**
1. Design the data layer around an **event-driven pattern** from day one, even with mocks. Use an EventEmitter, RxJS observable, or simple pub/sub pattern internally. Mock services emit events on a timer; real services emit events from WebSocket messages.
2. Components subscribe to state changes, they do not fetch-and-set. Use a state store (Zustand is lightweight and fits well) where the data layer writes into the store and components react to store changes. This pattern works identically for mock timers and real WebSocket events.
3. Mock the **WebSocket connection itself**, not just the data. Create a `MockWebSocket` class that emits events on intervals, simulating agent lifecycle events (`start`, `end`, `error`, `tool_start` with `needsApproval`). The real WebSocket client plugs into the same event handler.

**Warning signs:**
- Components use `useEffect` + `fetch` + `setInterval` for "real-time" updates
- No event/subscription pattern in the codebase
- State updates only happen on user actions or page loads
- No concept of "incoming events" in the mock layer

**Phase to address:**
Phase 1 (Scaffolding) for the architecture pattern; Phase 2 (first screens) must validate the pattern works with mock event streams.

---

### Pitfall 5: Vite Ruby Development Server Performance Bottleneck

**What goes wrong:**
In development, page loads take 10-30 seconds. The browser shows dozens of pending requests. HMR updates are slow or do not work. Developers blame Rails or React when the actual bottleneck is Vite Ruby's default proxy configuration.

**Why it happens:**
Vite does not bundle code during development -- it serves individual ES modules. A React app with many components can generate hundreds of individual asset requests. By default, vite_rails proxies all these requests through the Rails server (`/vite-dev/*`), which passes through Puma. Puma's default 3-thread configuration creates a severe bottleneck -- each asset request occupies a thread, and requests queue behind each other.

**How to avoid:**
1. Set `skipProxy: true` in `config/vite.json` so browser requests go directly to the Vite dev server (typically port 3036) rather than proxying through Rails.
2. If not using `skipProxy`, increase Puma threads to 50-100 in development config only.
3. Configure `bin/dev` (via Procfile.dev) to start both Vite and Rails dev servers. Verify both are running before testing.
4. Pin `VITE_RUBY_HOST` to `127.0.0.1` explicitly -- IPv6 `::1` resolution causes connection refused errors on some systems.

**Warning signs:**
- Development page loads over 5 seconds
- Browser network tab shows 50+ requests queued with "Stalled" status
- HMR updates take several seconds instead of being instant
- `net::ERR_CONNECTION_REFUSED` errors for Vite assets intermittently

**Phase to address:**
Phase 1 (Scaffolding) -- must be configured correctly before any meaningful development begins. A slow dev loop kills productivity from day one.

---

### Pitfall 6: Charting Library Choice Causes Performance Death at Scale

**What goes wrong:**
Developers pick Recharts (popular, well-documented, React-friendly) for all charts including the real-time token usage timeline and agent activity timeline. The dashboard becomes sluggish when displaying time-series data with frequent updates. SVG-based rendering chokes on re-renders triggered by WebSocket events pushing new data points every few seconds.

**Why it happens:**
Recharts uses SVG rendering, which is performant for static or infrequently-updated charts with under 10,000 data points. The OpenClaw dashboard has multiple charts that update in real-time (agent activity timeline, token usage sparklines on every card, usage over time stacked area chart). Each WebSocket event triggers a state update, which triggers SVG re-renders across all visible charts. SVG DOM manipulation at this frequency causes frame drops.

**How to avoid:**
1. Use **Recharts for static/low-frequency charts**: cost breakdown donut, API calls bar chart, latency histogram. These update only on time period changes, not on every event.
2. For **real-time updating charts** (agent activity timeline, sparklines), use a Canvas-based library or lightweight custom Canvas component. Lightweight options: `uPlot` (tiny, fast, Canvas-based) or custom `<canvas>` sparklines.
3. Alternatively, **throttle chart updates**: buffer incoming events and update charts at most once per second, regardless of event frequency. Use `requestAnimationFrame` or a 1-second debounce on the chart data setter.
4. Memoize chart components aggressively with `React.memo` and ensure chart data arrays are referentially stable (do not recreate arrays on every render).

**Warning signs:**
- Dashboard FPS drops below 30 when multiple charts are visible
- React DevTools shows chart components re-rendering on every state update
- Browser performance profiler shows heavy "Recalculate Style" and "Layout" entries tied to SVG elements
- Sparklines on agent cards cause the entire grid to feel sluggish

**Phase to address:**
Phase 2-3 (when building Dashboard and Usage screens). Validate chart performance with realistic data volumes (50+ agents, events every 2-3 seconds) early, not after all screens are built.

---

### Pitfall 7: Kanban Board Drag-and-Drop Becomes a Maintenance Nightmare

**What goes wrong:**
The Task Board Kanban with 6 columns (Backlog, Queued, In Progress, Awaiting Approval, Completed, Failed) uses `react-beautiful-dnd` because it was the top search result. The library is unmaintained (last release 2022, deprecated by Atlassian). Bugs accumulate. React 18+ strict mode causes double-render issues. The team either pins to an old React version or spends days working around library bugs.

**Why it happens:**
`react-beautiful-dnd` dominated the Kanban ecosystem for years and still appears in most tutorials. Its deprecation is not immediately obvious -- it still installs and mostly works. But it has known issues with React 18 StrictMode, no bug fixes are coming, and the codebase is archived.

**How to avoid:**
1. Use **@dnd-kit/core** and **@dnd-kit/sortable** for the Kanban board. It is actively maintained, tree-shakeable (12KB gzipped core), achieves 60fps with hundreds of items, and has first-class keyboard/screen-reader accessibility.
2. Implement **optimistic drag state** -- update the UI immediately on drop, then sync with the backend. If the backend rejects the move (invalid state transition), revert the card position with an animation and show a toast error.
3. The Kanban state machine should enforce valid transitions: Backlog -> Queued -> In Progress -> Awaiting Approval -> Completed/Failed. Do not allow arbitrary drag between all columns -- some transitions are invalid (you cannot drag from Completed back to In Progress without a retry action).

**Warning signs:**
- Console warnings about deprecated lifecycle methods from the DnD library
- Drag operations break in React StrictMode
- Library has not been updated in 12+ months
- Cards "snap" to wrong positions after drop

**Phase to address:**
Phase 3 (Task Board screen). Library choice must be deliberate; do not copy from a tutorial.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded mock data in components | Fast initial prototyping | Every component needs refactoring when real data arrives; no loading/error states | Never -- use service layer from day one, it costs minutes to set up |
| `any` TypeScript types for API responses | Skip type definition work | No autocomplete, no compile-time safety, bugs surface at runtime | Only in spike/exploration code that will be rewritten |
| Skip SPA catch-all constraints | Works in development (same port) | Breaks when routes are added, breaks in production, swallows API routes | Never -- constraints cost 3 lines of code |
| `setInterval` polling instead of event architecture | Simpler than pub/sub pattern | Must rewrite to WebSocket pattern; polling wastes resources; UI feels stale | Acceptable for Settings page (low-frequency data) only |
| Single global Zustand/Redux store | Less boilerplate initially | Performance issues as store grows; every WebSocket event re-renders everything | Acceptable for MVP if store is sliced by domain (agents, tasks, approvals) from the start |
| Skip responsive layout until later | Build desktop-first faster | Retrofitting responsive is painful; layout assumptions get baked in | Acceptable if base layout uses Tailwind grid/flex from the start and breakpoints are in the design system |
| jbuilder without eager loading | Works for small datasets | N+1 queries on agent fleet (each agent -> current task -> tokens) cause 100ms+ API responses | Never -- always use `.includes()` on associations from first query |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Devise + React SPA | Skipping CSRF tokens or disabling them entirely with `skip_before_action :verify_authenticity_token` | Serve CSRF token via `<meta>` tag in Rails layout; read in React API client. Keep session auth since app is same-origin. |
| vite_rails + Puma | Using default 3 Puma threads with Vite proxy | Set `skipProxy: true` in vite.json or increase Puma threads to 50+ in development. |
| vite_rails + React HMR | Missing `vite_react_refresh_tag` in Rails layout | Add `<%= vite_react_refresh_tag %>` in `<head>` before `vite_javascript_tag`. Required for React Fast Refresh to work. |
| ActionCable + React | Using ActionCable for all real-time updates including mock phase | ActionCable is for the real Gateway integration phase. Mock phase should use a mock event emitter with the same interface, not ActionCable with mock channels. |
| Tailwind + Custom Design System | Using `dark:` prefix classes for a dark-only app, or fighting Tailwind defaults | This app is dark-mode only. Configure custom colors as the default palette in `tailwind.config.js`, not as dark variants. No `dark:` prefix needed. |
| jbuilder + React API | Returning deeply nested JSON that couples frontend to backend structure | Define flat, frontend-friendly JSON shapes in jbuilder templates. Frontend should not need to traverse `agent.current_task.assigned_to.name` -- flatten it. |
| PostgreSQL in Docker + Rails | Mismatched `pg_dump` version between local machine and Docker PostgreSQL 17 | Install `postgresql@17` locally via Homebrew and `brew link postgresql@17 --force`. Without this, `db:schema:dump` (run after every migration) fails silently or produces incompatible SQL. |
| Font Awesome icons | Loading entire Font Awesome library for 20 icons | Use `@fortawesome/react-fontawesome` with tree-shaking -- import only the specific icons used. Or use SVG icon components. Full FA is 300KB+. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering entire agent grid on every WebSocket event | Grid/table feels sluggish, FPS drops, React DevTools shows 50+ component re-renders per event | Slice state by entity: `useAgentStore(agentId)` selector pattern. Only the affected agent card re-renders. | Noticeable at 20+ agents with events every 2-3 seconds |
| Unthrottled chart re-renders on streaming data | Charts consume 60%+ CPU, dashboard becomes unresponsive | Batch updates: collect events for 1 second, then push one chart update. Use `requestAnimationFrame`. | Noticeable with 3+ visible charts updating simultaneously |
| Kanban board re-rendering all columns on any card move | Drag feels laggy, column transitions animate poorly | Memoize column components. Pass only the card IDs for each column, not full card objects. Use `React.memo` with shallow comparison. | Noticeable at 30+ total cards across columns |
| N+1 queries on Agent Fleet API endpoint | Page load takes 500ms+ for agent list; Bullet gem fires warnings | Eager-load all associations: `Agent.includes(:current_task, :token_usage_summary).where(...)`. Use jbuilder `cache!` for stable data. | Noticeable at 15+ agents |
| Loading all historical task data for Kanban | Task Board initial load slow, memory bloat in browser | Paginate by status: load Completed/Failed only last 24h and cap at 50. Load Backlog/Queued/In Progress fully. Infinite scroll for history. | Noticeable at 100+ total tasks |
| SVG sparklines in every agent card | Browser struggles with 50+ SVG elements animating simultaneously | Use Canvas-based sparklines or pre-render sparkline data as a static image/path. Update sparklines on a 30-second interval, not real-time. | Noticeable at 20+ agent cards in grid view |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing Gateway WebSocket token in React bundle | Anyone with browser DevTools can extract the token and connect to the Gateway directly, bypassing the dashboard's access control | Gateway token must stay server-side only. Rails backend connects to Gateway; React talks to Rails API. Never pass `OPENCLAW_GATEWAY_TOKEN` to the frontend. |
| No authorization on approve/deny API endpoints | Any authenticated user can approve critical deployments or budget overrides | Even though there is no multi-tenancy, add role-based checks. At minimum, require re-authentication for critical approvals (P0/Critical). |
| Mock data containing realistic-looking secrets | Mock API keys, tokens, or paths in mock data accidentally match real credentials when deployed alongside real OpenClaw | Use obviously fake mock values: `mock_token_xxx`, `agt_mock_001`. Never use values that could collide with real Gateway tokens or agent IDs. |
| Serving the SPA without session timeout | Local app left open indefinitely; anyone with physical access to the machine has dashboard access | Configure Devise session timeout (e.g., 8 hours for a local app). Add a "session expired" handler in React that redirects to login. |
| Trusting client-side Kanban state for task transitions | User drags a card to "Completed" but the task is actually still running; UI shows false state | All state transitions must be validated server-side. Kanban drag triggers an API call; the API validates the transition is valid given the current server-side state. Return the authoritative state. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual distinction between mock and real data | Operator makes decisions based on mock data thinking it is real; approves mock tasks, panics at mock failures | Display a persistent banner ("Demo Mode -- Mock Data") when mock layer is active. Use a distinct accent color or watermark. Remove banner only when Gateway is connected. |
| Approval actions with no confirmation | Operator accidentally approves a Critical production deployment with a single mis-click | P0/Critical approvals require a confirmation step (type agent name to confirm, or 2-click). P2/P3 can be single-click. "Approve All" must always require confirmation. |
| Stale dashboard with no "last updated" indicator | Operator sees data from 30 minutes ago, makes decisions based on outdated state, does not realize the connection dropped | Show "Last updated: Xs ago" in the header. If data is older than the configured refresh interval, show an amber warning. If WebSocket disconnects, show a red "Disconnected" banner with reconnect button. |
| Kanban drag with no undo | Operator accidentally drags a card to the wrong column; state is immediately persisted; no way to revert | Implement a 5-second undo toast after every drag operation. Delay the server-side state change until undo window expires, or allow immediate revert. |
| Charts with no empty state | Usage screen shows broken chart containers when there is no data (new installation, first boot) | Every chart needs an empty state: centered message ("No data for this period"), proper sizing, and a suggestion ("Agents will appear here once connected"). |
| Dense data tables with no column prioritization on smaller screens | Agent Fleet table is unusable on tablet; all columns squished, text truncated to unreadable | Define column priority: always show (name, status), show on tablet+ (current task, uptime), show on desktop only (tokens, ID). Or switch to card view automatically below breakpoint. |

## "Looks Done But Isn't" Checklist

- [ ] **Auth flow:** Login works, but does the session persist on page refresh? Does navigating to a protected route when logged out redirect to login? Does the CSRF token rotate correctly?
- [ ] **SPA routing:** Routes work when clicking links, but do they work on direct URL entry and browser refresh? (Catch-all route test)
- [ ] **Mock data layer:** Components render with mock data, but do they handle the empty state (zero agents, zero tasks)? The error state (service unavailable)? The loading state (data not yet arrived)?
- [ ] **Kanban drag-and-drop:** Cards drag and drop in the happy path, but what about: dragging to an invalid column? Dropping on a column with 50+ cards? Dragging while a WebSocket update moves the same card? Keyboard-only drag for accessibility?
- [ ] **Charts:** Charts render with sample data, but do they handle: zero data points? A single data point? Data spanning exactly the boundary of the selected time range? Window resize?
- [ ] **Responsive layout:** Desktop looks correct, but does the sidebar collapse on mobile? Do tables switch to card view? Is the Kanban horizontally scrollable on narrow screens?
- [ ] **Dark theme:** All custom components use the design system colors, but do third-party components (date pickers, dropdowns, modals, chart tooltips) also render in dark theme? Or do they flash white?
- [ ] **Error handling:** API calls succeed, but what happens when they fail? Is there a global error boundary? Do individual components show contextual errors or does the whole page crash?
- [ ] **Hot Module Replacement:** HMR works for component changes, but does it preserve React state? Does it work for Tailwind class changes? Does it work for jbuilder template changes (it should not -- that requires a page reload)?
- [ ] **Vite production build:** Development works with Vite dev server, but does `vite build` produce correct assets? Are all asset paths correct in production mode? Is the Rails asset pipeline configured to serve Vite output?

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Mock data entangled in components | HIGH | Extract service layer, define TypeScript interfaces, create adapter pattern. Touch every component file. Budget 2-3 days for a 7-screen app. |
| Devise CSRF/session misconfigured | LOW | Add CSRF meta tag to layout, configure fetch interceptor, test login flow. 2-4 hours. |
| Catch-all route swallowing API routes | LOW | Reorder routes, add constraints. 1 hour plus regression testing. |
| No event-driven architecture for WebSocket transition | HIGH | Introduce state store, refactor all data fetching to subscriptions, create event bus. Budget 3-5 days. |
| Vite proxy bottleneck | LOW | Set `skipProxy: true` in vite.json. 5 minutes. |
| Wrong charting library for real-time data | MEDIUM | Replace specific charts (timeline, sparklines) with Canvas-based alternatives. Keep Recharts for static charts. Budget 1-2 days per chart type. |
| react-beautiful-dnd deprecated | MEDIUM | Migrate to dnd-kit. API is different so drag handlers need rewriting. Budget 1-2 days for a single Kanban board. |
| No mock/real data visual distinction | LOW | Add environment check and banner component. 2-3 hours. |
| N+1 queries on fleet endpoint | LOW | Add `.includes()` calls, install Bullet gem. 1-2 hours per endpoint. |
| Third-party components flash white in dark theme | MEDIUM | Override or wrap each third-party component with dark theme styles. Budget 0.5-1 day depending on number of components. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Mock data layer entanglement | Phase 1: Scaffolding | Service layer exists with TypeScript interfaces; at least one mock service implements the interface; components import from service, not mock data |
| Devise + React auth mismatch | Phase 1: Scaffolding | Can log in from React, make authenticated API call, refresh page and remain logged in, and log out -- all without CSRF errors |
| Catch-all route conflicts | Phase 1: Scaffolding | Request spec proves `/api/*` returns JSON and `/*` returns HTML. HMR and ActionCable endpoints still work. |
| Missing event-driven architecture | Phase 1-2: Scaffolding + First Screens | Mock data emits events on timers; at least one component (Dashboard KPIs) updates reactively from event stream, not fetch-on-mount |
| Vite dev server bottleneck | Phase 1: Scaffolding | Page load under 3 seconds in development with `skipProxy: true` or sufficient Puma threads |
| Chart performance at scale | Phase 2-3: Dashboard + Usage Screens | Dashboard with 50 mock agents and events every 2 seconds maintains 30+ FPS in Chrome DevTools Performance tab |
| Kanban DnD library choice | Phase 3: Task Board | dnd-kit installed and working with React 18 StrictMode; drag between columns works; invalid transitions blocked |
| No mock/real data banner | Phase 2: First Screen | Persistent "Demo Mode" banner visible; environment flag controls it |
| N+1 query patterns | Phase 2: First API Endpoints | Bullet gem installed in development; no N+1 warnings in test suite |
| Third-party dark theme gaps | Phase 2: Design System Setup | All third-party components (date pickers, select dropdowns, chart tooltips, modals) render with dark theme; no white flash |
| Security: Gateway token exposure | Phase 1: Scaffolding | `OPENCLAW_GATEWAY_TOKEN` is in `.env` only; `grep` of JavaScript bundle output confirms no token present |
| Approval UX safety | Phase 4: Approvals Screen | Critical approvals require confirmation step; "Approve All" requires explicit confirmation; undo available for accidental actions |

## Sources

- [Vite Ruby Troubleshooting Guide](https://vite-ruby.netlify.app/guide/troubleshooting) -- proxy performance, HMR issues, configuration gotchas
- [Rails CSRF protection for SPA](https://blog.eq8.eu/article/rails-api-authentication-with-spa-csrf-tokens.html) -- Devise + SPA auth patterns
- [Rails API + React SPA authentication problem](https://medium.com/@evanilukhin/rails-api-react-spa-authentication-problem-authentication-by-cookies-eadd87d86ea9) -- cookie-based auth pitfalls
- [Building with Mock Data: Smart Front-End Strategy or Future Headache?](https://medium.com/lotuss-it/building-with-mock-data-smart-front-end-strategy-or-future-headache-548cafe95c7b) -- mock data layer drift
- [Building a Scalable Frontend Mock Architecture with MSW](https://dev.to/mrajaeim/building-a-scalable-frontend-mock-architecture-with-msw-factories-and-services-uber-like-3kgi) -- structured mock patterns
- [Optimizing Real-Time Performance: WebSockets and React.js Integration](https://medium.com/@SanchezAllanManuel/optimizing-real-time-performance-websockets-and-react-js-integration-part-ii-4a3ada319630) -- batching, throttling, memoization for real-time
- [Best React Chart Libraries (2025)](https://blog.logrocket.com/best-react-chart-libraries-2025/) -- Recharts SVG limitations, Canvas alternatives
- [Recharts Performance Guide](https://recharts.github.io/en-US/guide/performance/) -- official optimization strategies
- [Top 5 Drag-and-Drop Libraries for React in 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) -- dnd-kit recommended over deprecated react-beautiful-dnd
- [Build a Kanban Board with dnd-kit](https://radzion.com/blog/kanban/) -- implementation patterns
- [Blazing Fast Rails View Rendering -- From JBuilder to Fast JSON API](https://medium.com/nugit-engineering/blazing-fast-rails-view-rendering-15c7f52c1cfa) -- jbuilder performance considerations
- [Common Mistakes in React Admin Dashboards](https://dev.to/vaibhavg/common-mistakes-in-react-admin-dashboards-and-how-to-avoid-them-1i70) -- state management, performance
- [Vite Ruby Rails Integration Guide](https://vite-ruby.netlify.app/guide/rails.html) -- entry point configuration, proxy settings
- [mock-socket](https://github.com/thoov/mock-socket) -- WebSocket mocking library for testing

---
*Pitfalls research for: Real-time AI agent management dashboard (Rails API + React SPA)*
*Researched: 2026-03-25*
