# Phase 10: Settings - Research

**Researched:** 2026-03-28
**Domain:** Settings/Configuration UI, form state management, React patterns
**Confidence:** HIGH

## Summary

Phase 10 builds the Settings page -- a form-heavy configuration screen with four tabs (General, Agents, Notifications, Data Sources) and Save/Discard actions. The backend infrastructure is already complete from Phase 4: a `Setting` model with `key`/`value(jsonb)` pairs, `SettingsService`, a REST controller, and React Query hooks (`useSettings`, `useSetting`, `useUpdateSetting`). The frontend currently has a placeholder `SettingsPage`.

The primary challenge is form state management -- tracking dirty state across multiple settings, enabling Save/Discard actions, and handling the mismatch between the per-key API (PATCH /settings/:key) and the user expectation of a single "Save" action that persists all changes. There is also a bug in the settings controller that needs fixing: it calls `SettingsService.find_by(key: ...)` but the service defines `find_by_key(key)`, causing show/update actions to fail with NoMethodError.

The design mockup (screenshot_2.png, HTML mockup) provides a clear layout: left sidebar tabs (horizontal on mobile, vertical on desktop), form fields in a label-description-left + input-right grid layout (1/3 + 2/3), toggle switches, chip-style multi-select for tools, and dropdown selects for timezone/refresh interval. All UI components needed (Input, Button, Card, Badge) already exist in the design system except for a Toggle/Switch component.

**Primary recommendation:** Use React local state (useState) for form dirty tracking within the SettingsPage, not Zustand. Load all settings via the existing `useSettings()` hook, build a local form state object, diff against the original to determine changes, and fire parallel `useUpdateSetting` mutations for each changed key on Save.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SETT-01 | General tab -- display name, timezone dropdown, dashboard refresh interval | Existing seed data provides 3 settings (`general.display_name`, `general.timezone`, `general.refresh_interval`). Design spec maps exact field types and options. |
| SETT-02 | Agents tab -- default budget, auto-restart toggle, global allowed tools multi-select | Existing seed data provides 3 settings (`agents.default_budget_cents`, `agents.auto_restart`, `agents.allowed_tools`). Requires new Toggle component and multi-select chip UI. |
| SETT-03 | Notifications tab -- alert thresholds for budget, failures, approval timeout, agent offline | Existing seed data provides 4 settings (`notifications.budget_threshold`, `notifications.failure_alert`, `notifications.approval_timeout_minutes`, `notifications.agent_offline_minutes`). Simple number inputs. |
| SETT-04 | Data Sources tab -- Gateway WebSocket URL, auth token, OpenClaw home directory, session path, refresh interval | Only 2 of 5 settings exist in seeds (`datasource.gateway_url`, `datasource.openclaw_home`). Need to add 3 more seeds: `datasource.auth_token`, `datasource.session_path`, `datasource.refresh_interval`. |
| SETT-05 | Save Configuration / Discard Changes actions | Form state management pattern: local state diffing against server state, parallel PATCH mutations on save, state reset on discard. |
| SETT-06 | Left sidebar tab navigation (General, Agents, Notifications, Data Sources) | Design mockup shows vertical sidebar on desktop, horizontal scrollable on mobile. Matches existing tab pattern from ApprovalsPage but with sidebar layout. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech stack**: Ruby 3.3.3, Rails 8.0.5, React 19, TypeScript, PostgreSQL 17, Vite, Tailwind CSS v4
- **Testing**: RSpec, Factory Bot, Faker, Playwright with cypress-on-rails, RuboCop
- **App location**: Rails app in `source/dashboard`
- **Serialization**: jbuilder for JSON responses
- **Assets**: vite_rails for React, Tailwind for styling
- **State management**: TanStack React Query for server state, Zustand for UI-only state
- **Icons**: Font Awesome 6.x (free-solid-svg-icons)
- **Utilities**: clsx + tailwind-merge via `cn()` helper
- **Toast notifications**: sonner
- **RuboCop before commits**: `bin/rubocop -A .` required before any Ruby commit

## Standard Stack

### Core (Already In Place)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| React | ^19.2.4 | Frontend SPA | Installed |
| TypeScript | ^5.7.x | Type safety | Installed |
| TanStack React Query | ^5.95.0 | Server state (settings CRUD) | Installed, hooks exist |
| Zustand | ^5.0.12 | UI state (NOT for form state) | Installed |
| Tailwind CSS | ^4.2.2 | Styling | Installed |
| @fortawesome/react-fontawesome | ^3.3.0 | Icons | Installed |
| sonner | ^2.x | Toast notifications | Installed |
| clsx + tailwind-merge | installed | `cn()` utility | Installed |

### No Additional Libraries Needed

This phase requires no new npm packages or gems. All needed functionality is achievable with:
- Existing UI components (Input, Button, Card, Badge, Modal)
- Native HTML elements (`<select>`, `<input type="number">`)
- React useState for form state management
- Existing TanStack Query hooks for data fetching/mutation

## Architecture Patterns

### Recommended Component Structure
```
app/frontend/
  components/
    settings/
      SettingsTabs.tsx          # Left sidebar tab navigation
      GeneralTab.tsx            # General preferences form section
      AgentsTab.tsx             # Agent policies form section
      NotificationsTab.tsx      # Alert thresholds form section
      DataSourcesTab.tsx        # Data source integration form section
      SettingsFormRow.tsx        # Reusable label+description | input grid row
      Toggle.tsx                # Toggle/switch component (new UI primitive)
      ToolChipSelect.tsx        # Multi-select chip component for allowed tools
    pages/
      SettingsPage.tsx          # Page composition (replace placeholder)
```

### Pattern 1: Settings Form Row (Label-Description | Input Grid)
**What:** Every settings field follows a consistent 1/3 + 2/3 grid layout from the design.
**When to use:** Every form field in every tab.
**Example:**
```typescript
// Reusable layout component matching the design mockup
interface SettingsFormRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingsFormRow({ label, description, children }: SettingsFormRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
      <div className="md:col-span-1">
        <label className="block text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}
```

### Pattern 2: Form State Management (Local State + Diff)
**What:** Track form edits in local React state, diff against original server data to detect dirty fields.
**When to use:** The SettingsPage component that wraps all tabs.
**Why not Zustand:** Form state is ephemeral, page-scoped, and maps directly to server state. Zustand is for persistent UI state (sidebar open, view toggles) that survives navigation. Settings form state should reset on navigation away.
**Example:**
```typescript
// In SettingsPage.tsx
type SettingsFormState = Record<string, unknown>; // key -> value mapping

function SettingsPage() {
  const { data, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [formState, setFormState] = useState<SettingsFormState>({});
  const [originalState, setOriginalState] = useState<SettingsFormState>({});

  // Initialize form state from server data
  useEffect(() => {
    if (data?.data) {
      const initial: SettingsFormState = {};
      data.data.forEach((s) => { initial[s.key] = s.value; });
      setFormState(initial);
      setOriginalState(initial);
    }
  }, [data]);

  // Detect dirty state
  const isDirty = JSON.stringify(formState) !== JSON.stringify(originalState);

  // Get changed keys
  function getChangedKeys(): string[] {
    return Object.keys(formState).filter(
      (key) => JSON.stringify(formState[key]) !== JSON.stringify(originalState[key])
    );
  }

  // Save: fire parallel mutations for changed settings only
  async function handleSave() {
    const changedKeys = getChangedKeys();
    await Promise.all(
      changedKeys.map((key) =>
        updateSetting.mutateAsync({ key, value: formState[key] })
      )
    );
    setOriginalState({ ...formState });
    toast.success("Settings saved");
  }

  // Discard: reset to original
  function handleDiscard() {
    setFormState({ ...originalState });
  }
}
```

### Pattern 3: Tab Navigation (Sidebar Vertical Tabs)
**What:** Vertical tab list on desktop (lg:flex-col), horizontal scrollable on mobile.
**When to use:** Settings page left sidebar.
**Example:**
```typescript
type SettingsTab = "general" | "agents" | "notifications" | "datasources";

const tabs: { id: SettingsTab; label: string; icon: IconDefinition }[] = [
  { id: "general", label: "General", icon: faSliders },
  { id: "agents", label: "Agents", icon: faRobot },
  { id: "notifications", label: "Notifications", icon: faBell },
  { id: "datasources", label: "Data Sources", icon: faDatabase },
];

function SettingsTabs({ active, onChange }: { active: SettingsTab; onChange: (t: SettingsTab) => void }) {
  return (
    <nav className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md w-full text-left whitespace-nowrap lg:whitespace-normal transition-colors",
            active === tab.id
              ? "bg-surface-hover text-accent"
              : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          )}
        >
          <FontAwesomeIcon icon={tab.icon} className="w-4" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
```

### Pattern 4: Toggle Switch Component
**What:** A new reusable toggle/switch component for boolean settings (auto-restart, notification enables).
**When to use:** Any boolean on/off setting.
**Example:**
```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  const id = React.useId();
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
          checked ? "bg-accent" : "bg-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  );
}
```

### Pattern 5: Tool Chip Multi-Select
**What:** Display selected tools as removable chips, with a dropdown to add more.
**When to use:** Agents tab "Global Allowed Tools" field.
**Example:**
```typescript
interface ToolChipSelectProps {
  selected: string[];
  available: string[];
  onChange: (tools: string[]) => void;
}

function ToolChipSelect({ selected, available, onChange }: ToolChipSelectProps) {
  const unselected = available.filter((t) => !selected.includes(t));

  function addTool(tool: string) {
    onChange([...selected, tool]);
  }

  function removeTool(tool: string) {
    onChange(selected.filter((t) => t !== tool));
  }

  return (
    <div className="bg-background border border-border rounded-md p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {selected.map((tool) => (
          <span key={tool} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-hover border border-border text-text-primary">
            {tool}
            <button onClick={() => removeTool(tool)} className="ml-1 text-text-secondary hover:text-danger">
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <select className="flex-1 bg-surface border border-border rounded-md py-1.5 pl-3 pr-8 text-sm text-text-primary">
          <option disabled selected>Select a tool to add...</option>
          {unselected.map((tool) => (
            <option key={tool} value={tool}>{tool}</option>
          ))}
        </select>
        <Button variant="secondary" size="sm" onClick={/* add selected option */}>Add</Button>
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Zustand for form state:** Do not use Zustand for the settings form. Form state is transient and page-scoped. Using Zustand would cause stale state on re-navigation and add unnecessary complexity.
- **Single mega-form component:** Do not put all four tabs' fields in one component. Split each tab into its own component that receives formState + onChange handlers as props.
- **Batch API endpoint:** Do not create a new batch update endpoint on the backend. The existing per-key PATCH is sufficient. Fire parallel requests for changed keys. For 1-12 settings, parallel PATCHes are fast and maintain the existing simple API contract.
- **Custom dropdown components:** Do not build custom dropdown/select components. Native `<select>` elements match the design and work with the existing dark-mode styling (`bg-background border border-border` classes). The design mockup uses native selects.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timezone list | Static array of 400+ IANA zones | Curated list of ~30 common timezones | Design shows 4 options; a short curated list covers real use cases without IANA library overhead |
| Form dirty detection | Deep comparison library | `JSON.stringify` comparison | Settings values are simple JSON objects (1-3 keys each). Stringify comparison is sufficient and zero-dependency |
| Toggle switch | CSS checkbox hack (as in HTML mockup) | Dedicated Toggle component with `role="switch"` | The HTML mockup uses a checkbox hack. A proper accessible toggle component with ARIA `role="switch"` is better for React |
| Toast notifications | Custom notification system | sonner (already installed) | Project already uses sonner throughout (NewTaskModal, ApprovalsPage) |

## Common Pitfalls

### Pitfall 1: SettingsService Method Name Mismatch (BUG)
**What goes wrong:** The controller calls `SettingsService.find_by(key: params[:key])` but the service only defines `self.find_by_key(key)`. This causes a `NoMethodError` on the show and update actions.
**Why it happens:** The controller was written expecting a `find_by` method that takes keyword args, but the service was implemented with `find_by_key` that takes a positional arg.
**How to avoid:** Fix the service to add `self.find_by(key:)` as an alias or rename the existing method. The request spec confirms 2 out of 5 tests fail on this bug.
**Warning signs:** `GET /api/v1/settings/:key` returns 500, `PATCH /api/v1/settings/:key` returns 500.

### Pitfall 2: Missing Seed Data for Data Sources Tab
**What goes wrong:** SETT-04 requires 5 fields (gateway URL, auth token, home directory, session path, refresh interval) but only 2 exist in seeds (`datasource.gateway_url`, `datasource.openclaw_home`).
**Why it happens:** The seed data was created for Phase 4 baseline, before the full Data Sources tab requirements were specified.
**How to avoid:** Add 3 new seed settings: `datasource.auth_token`, `datasource.session_path`, `datasource.refresh_interval`. Add migration or seed update.
**Warning signs:** Data Sources tab shows empty/missing fields after loading.

### Pitfall 3: JSONB Value Shape Inconsistency
**What goes wrong:** Each setting stores its value as a JSONB object with different shapes: `{ name: "..." }`, `{ timezone: "..." }`, `{ seconds: 30 }`, `{ tools: [...] }`, etc. The frontend must know each setting's value shape to render the correct input.
**Why it happens:** The generic `Setting` model uses `value: unknown` in TypeScript.
**How to avoid:** Define typed interfaces for each setting category. Create helper functions to extract/construct the expected value shape per setting key.
**Warning signs:** TypeScript `unknown` type requires casting everywhere; runtime errors from wrong property access.

### Pitfall 4: Save Button Fires on Unchanged Settings
**What goes wrong:** Clicking Save when nothing changed wastes API calls and shows a misleading success toast.
**Why it happens:** No dirty detection implemented.
**How to avoid:** Disable the Save button when `isDirty === false`. Only PATCH settings whose values actually changed (use `getChangedKeys()` pattern from Architecture section).
**Warning signs:** Save button always enabled; unnecessary network requests.

### Pitfall 5: Form State Not Reset After Server Fetch
**What goes wrong:** After saving, the form still shows "dirty" state or reverts to stale data.
**Why it happens:** The `useSettings` query cache invalidation triggers a refetch, but the local form state is not updated from the new server data.
**How to avoid:** Update both `formState` and `originalState` after successful save. The `onSuccess` callback in `useUpdateSetting` already invalidates the `["settings"]` query. In the save handler, after all mutations complete, update `originalState` to match `formState`.
**Warning signs:** "Unsaved changes" indicator persists after save; values revert on tab switch.

## Code Examples

### Existing Settings Hook (useSettings.ts) -- Already Works
```typescript
// Source: app/frontend/hooks/useSettings.ts
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiFetch<SettingsResponse>("/api/v1/settings"),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      apiMutate<Setting>(`/api/v1/settings/${key}`, "PATCH", {
        setting: { value },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
```

### Existing Input Component Pattern
```typescript
// Source: app/frontend/components/ui/Input.tsx
// Already supports: label, helperText, error, icon, forwardRef
// Use for: Display Name, text inputs in Data Sources tab
<Input
  label="Display Name"
  helperText="The name shown in the top navigation."
  value={formState["general.display_name"]?.name ?? ""}
  onChange={(e) => updateField("general.display_name", { name: e.target.value })}
/>
```

### Existing Select Dropdown Pattern (from NewTaskModal)
```typescript
// Source: app/frontend/components/tasks/NewTaskModal.tsx
// Native select with dark-mode styling -- reuse this pattern
<select
  className={cn(
    "w-full bg-background border border-border rounded-md py-2 px-3",
    "text-sm text-text-primary",
    "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent",
  )}
  value={currentValue}
  onChange={(e) => handleChange(e.target.value)}
>
  <option value="UTC">UTC (Coordinated Universal Time)</option>
  <option value="America/New_York">America/New_York (EST/EDT)</option>
  ...
</select>
```

### Existing Tab Pattern (from ApprovalsPage)
```typescript
// Source: app/frontend/components/pages/ApprovalsPage.tsx
// Horizontal tabs with role="tablist" and aria-selected
// Adapt to vertical layout for settings sidebar
<div className="flex border-b border-border" role="tablist">
  <button
    role="tab"
    aria-selected={activeTab === "pending"}
    aria-controls="panel-pending"
    className={cn(
      "px-4 py-2 text-sm border-b-2 transition-colors",
      activeTab === "pending"
        ? "border-accent text-text-primary font-semibold"
        : "border-transparent text-text-secondary"
    )}
    onClick={() => setActiveTab("pending")}
  >
    Pending
  </button>
</div>
```

### Existing Toast Pattern (from multiple components)
```typescript
// Source: app/frontend/components/tasks/NewTaskModal.tsx
import { toast } from "sonner";
toast.success("Settings saved");
toast.error("Failed to save settings");
```

### Backend Fix: SettingsService Method Name
```ruby
# Fix: app/services/settings_service.rb
# Option A: Add find_by method matching controller call
def self.find_by(key:)
  Setting.find_by!(key: key)
end

# Option B: Change controller to call find_by_key
# In settings_controller.rb:
# @setting = SettingsService.find_by_key(params[:key])
```

### Seed Data Addition for Missing Data Source Settings
```ruby
# Add to seeds.rb settings array:
{ key: 'datasource.auth_token', value: { token: '' } },
{ key: 'datasource.session_path', value: { path: '~/.openclaw/agents/' } },
{ key: 'datasource.refresh_interval', value: { seconds: 5 } }
```

## Setting Key Map (Complete)

All 15 settings needed for the four tabs:

| Tab | Key | Value Shape | Seed Exists |
|-----|-----|-------------|-------------|
| General | `general.display_name` | `{ name: string }` | Yes |
| General | `general.timezone` | `{ timezone: string }` | Yes |
| General | `general.refresh_interval` | `{ seconds: number }` | Yes |
| Agents | `agents.default_budget_cents` | `{ amount: number }` | Yes |
| Agents | `agents.auto_restart` | `{ enabled: boolean }` | Yes |
| Agents | `agents.allowed_tools` | `{ tools: string[] }` | Yes |
| Notifications | `notifications.budget_threshold` | `{ percent: number }` | Yes |
| Notifications | `notifications.failure_alert` | `{ enabled: boolean, consecutive: number }` | Yes |
| Notifications | `notifications.approval_timeout_minutes` | `{ minutes: number }` | Yes |
| Notifications | `notifications.agent_offline_minutes` | `{ minutes: number }` | Yes |
| Data Sources | `datasource.gateway_url` | `{ url: string }` | Yes |
| Data Sources | `datasource.openclaw_home` | `{ path: string }` | Yes |
| Data Sources | `datasource.auth_token` | `{ token: string }` | **No -- add** |
| Data Sources | `datasource.session_path` | `{ path: string }` | **No -- add** |
| Data Sources | `datasource.refresh_interval` | `{ seconds: number }` | **No -- add** |

## Timezone Options (Curated List)

Based on the design mockup (4 options shown) and common usage, use a curated list:

```typescript
const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver", label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "America/Anchorage", label: "America/Anchorage (AKST/AKDT)" },
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu (HST)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
];
```

## Refresh Interval Options

From the design spec:

```typescript
const REFRESH_INTERVAL_OPTIONS = [
  { value: 0, label: "Manual" },
  { value: 10, label: "10 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
];
```

## Available Tools List (for Multi-Select)

The seed data includes 4 default tools. Define the full available list for the dropdown:

```typescript
const AVAILABLE_TOOLS = [
  "file_read",
  "file_write",
  "shell_exec",
  "web_search",
  "database_query",
  "code_review",
  "api_call",
  "browser",
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-hook-form for all forms | useState for simple forms, react-hook-form for complex validation | Ongoing | Settings has simple validation (type coercion only). useState is sufficient and avoids a new dependency. |
| Single batch endpoint | Parallel per-key mutations | N/A | Multiple small PATCHes are simpler than a custom batch endpoint. TanStack Query handles parallel mutations and cache invalidation naturally. |

## Open Questions

1. **Navigation guard for unsaved changes**
   - What we know: The design shows Discard/Save buttons. If the user navigates away with unsaved changes, they lose edits silently.
   - What's unclear: Should we add a "You have unsaved changes" confirmation dialog on route change?
   - Recommendation: Skip for v1. The design does not show this pattern. Add if feedback requests it. The Save/Discard buttons are visible at the top of the page as a clear indicator.

2. **Data Sources "Test Connection" button**
   - What we know: The design mockup shows a "Test Connection" button next to the Gateway URL field with success feedback ("Connection successful. 12 agents found.").
   - What's unclear: There is no backend endpoint for connection testing. The Gateway WebSocket is not set up.
   - Recommendation: Include the button in the UI but show a toast with "Connection testing coming soon" (same pattern as the attachment area in NewTaskModal). This is consistent with the project scope: "Real OpenClaw Gateway WebSocket integration -- mock data first, wire up later."

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.4 + Playwright 1.52.x |
| Config file | `spec/rails_helper.rb` (RSpec), `e2e/playwright.config.js` (Playwright) |
| Quick run command | `cd source/dashboard && bundle exec rspec spec/requests/api/v1/settings_spec.rb` |
| Full suite command | `cd source/dashboard && bundle exec rspec` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SETT-01 | General tab renders with correct fields and values | e2e | Playwright settings page test | No -- Wave 0 |
| SETT-02 | Agents tab renders toggle, budget input, tool chips | e2e | Playwright settings page test | No -- Wave 0 |
| SETT-03 | Notifications tab renders threshold inputs | e2e | Playwright settings page test | No -- Wave 0 |
| SETT-04 | Data Sources tab renders all 5 fields | e2e | Playwright settings page test | No -- Wave 0 |
| SETT-05 | Save persists changes, Discard reverts | request | `bundle exec rspec spec/requests/api/v1/settings_spec.rb` | Yes (partially -- 2 failing tests) |
| SETT-06 | Tab navigation switches visible content | e2e | Playwright settings page test | No -- Wave 0 |
| BUG-FIX | SettingsService.find_by method exists | unit | `bundle exec rspec spec/models/setting_spec.rb spec/requests/api/v1/settings_spec.rb` | Yes (request spec fails) |

### Sampling Rate
- **Per task commit:** `cd source/dashboard && bundle exec rspec spec/requests/api/v1/settings_spec.rb --no-color`
- **Per wave merge:** `cd source/dashboard && bundle exec rspec --no-color`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Fix `SettingsService.find_by` bug -- 2 existing request tests fail
- [ ] Fix missing seed settings -- add 3 datasource seeds
- [ ] E2E test for settings page not yet needed (frontend-only validation via manual check pattern established in prior phases)

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `app/services/settings_service.rb`, `app/controllers/api/v1/settings_controller.rb` -- confirmed method name mismatch bug
- Codebase inspection: `db/seeds.rb` lines 264-280 -- confirmed 12 existing settings, 3 missing for SETT-04
- Codebase inspection: `app/frontend/hooks/useSettings.ts` -- confirmed existing TanStack Query hooks
- Codebase inspection: `app/frontend/components/ui/` -- confirmed Input, Button, Card, Badge, Modal exist; no Toggle exists
- Design mockup: `designs/html/2-OpenClaw Command - Settings Ov.html` + `designs/png/screenshot_2.png` -- full layout reference
- Design spec: `designs/TEAM_MANAGER_SPEC.md` sections 7.1-7.6 -- field types, defaults, helper text

### Secondary (MEDIUM confidence)
- Existing codebase patterns: `ApprovalsPage.tsx` tab pattern, `NewTaskModal.tsx` form pattern, `TaskFilters.tsx` filter button pattern -- established project conventions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed, no new dependencies needed
- Architecture: HIGH - patterns derived from existing codebase conventions and design mockup
- Pitfalls: HIGH - SettingsService bug confirmed by running tests (2 failures); seed gap confirmed by code inspection

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable -- no external dependency changes expected)
