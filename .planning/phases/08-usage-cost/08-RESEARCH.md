# Phase 8: Usage & Cost - Research

**Researched:** 2026-03-27
**Domain:** Data visualization (Recharts), Rails aggregation APIs, client-side CSV export
**Confidence:** HIGH

## Summary

Phase 8 replaces the UsagePage placeholder with a full Usage & Cost Tracking screen. The work splits into three layers: (1) backend data additions -- two new columns (`latency_ms`, `endpoint`) on `usage_records` via migration, extended seed data, and new aggregation methods in `UsageService`; (2) new API endpoints serving pre-aggregated chart data via jbuilder views; (3) four Recharts chart components (stacked area, donut, horizontal bar, histogram), KPI cards with trend indicators, a time period selector button group, and client-side CSV export.

The existing codebase provides strong foundations. `UsageService.summary` already computes `total_tokens`, `total_api_calls`, and `total_cost_cents`. The `filterStore.usageTimeRange` state is already typed as `"1h" | "6h" | "24h" | "7d" | "30d"` with getter/setter. Recharts 3.8.1 is installed and proven via the `Sparkline` component. The `AgentFilters` button-group pattern directly applies to the time period selector. Five chart colors are pre-defined as CSS custom properties (`--color-chart-1` through `--color-chart-5`).

**Primary recommendation:** Server-side aggregation via SQL GROUP BY in UsageService, served as dedicated jbuilder views. Frontend consumes pre-shaped data through new TanStack Query hooks. Each chart is an independent component wrapped in a `ChartCard` container. CSV export is pure client-side using Blob/URL.createObjectURL.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Add `latency_ms` integer column to UsageRecord via migration -- seed data generates realistic latency values (50-500ms range, varying by agent). Required for USAG-01 (avg latency KPI) and USAG-05 (latency histogram).
- **D-02:** Add `endpoint` string column to UsageRecord via migration -- seed data uses realistic API endpoint paths (e.g., "/v1/chat/completions", "/v1/embeddings", "/v1/models"). Required for USAG-04 (API calls by endpoint bar chart).
- **D-03:** Extend UsageService with aggregation methods for chart data: `by_agent_over_time`, `cost_by_agent`, `calls_by_endpoint`, `latency_distribution`. SQL GROUP BY per Phase 4 D-14.
- **D-04:** Add new API endpoint(s) or extend existing `/api/v1/usage` to serve aggregated chart data -- avoid sending raw records to the frontend for aggregation.
- **D-05:** KPI cards row at top (4 cards), then 2x2 grid for charts below. Stacked area (token usage) and donut (cost breakdown) on top row, horizontal bar (API calls) and histogram (latency) on bottom row. Full-width on mobile, 2-column on desktop.
- **D-06:** Percentage change vs previous period with directional arrow (up/down) and color coding (green for cost decrease, red for increase; green for throughput increase). Consistent with dashboard KPI patterns planned for Phase 9.
- **D-07:** Client-side CSV export using native browser APIs (no additional library). Export current time range data as CSV download. PDF deferred to future enhancement -- CSV covers the core need.

### Claude's Discretion
- Exact Recharts configuration (colors, tooltips, legends, responsive breakpoints)
- Chart animation and interaction patterns
- Loading skeleton design for charts
- Error and empty state handling per chart
- UsageService internal query optimization
- useUsage hook extensions vs new hooks for aggregated data

### Deferred Ideas (OUT OF SCOPE)
- PDF export -- defer to future enhancement, CSV covers core USAG-07 need
- Real-time chart updates via ActionCable -- future phase when Gateway integration happens
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| USAG-01 | KPI cards -- total tokens, total API calls, estimated cost, avg latency with trends | UsageService.summary extended with avg_latency_ms (requires D-01 latency_ms column). Trend calc via comparing current vs previous period. KPI card component using Card + FontAwesome icons. |
| USAG-02 | Token usage over time -- stacked area chart, one series per agent | UsageService.by_agent_over_time returns time-bucketed data grouped by agent_id. Recharts AreaChart with stackId prop on each Area. |
| USAG-03 | Cost breakdown by agent -- donut/pie chart | UsageService.cost_by_agent returns SUM(cost_cents) grouped by agent. Recharts PieChart with innerRadius for donut. |
| USAG-04 | API calls by endpoint -- horizontal bar chart | UsageService.calls_by_endpoint returns SUM(api_calls) grouped by endpoint (requires D-02 endpoint column). Recharts BarChart with layout="vertical". |
| USAG-05 | Latency distribution -- histogram | UsageService.latency_distribution returns bucketed latency counts (requires D-01 latency_ms column). Recharts BarChart with bucket ranges on XAxis. |
| USAG-06 | Time period selector button group (1h/6h/24h/7d/30d) | filterStore.usageTimeRange already typed and ready. Button group pattern from AgentFilters. |
| USAG-07 | Export report button (CSV) | Client-side CSV generation using Blob + URL.createObjectURL. D-07 scopes to CSV only. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.8.1 | All 4 chart types (stacked area, donut, horizontal bar, histogram) | Already installed. Verified in node_modules. Exports: AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer -- all confirmed available. |
| @tanstack/react-query | 5.95.2 | Server state for usage aggregation endpoints | Already installed. Standard hook pattern per Phase 4+. |
| zustand | 5.0.12 | UI state via filterStore.usageTimeRange | Already installed and configured. |
| date-fns | 4.1.0 | Date formatting for chart axes, time range calculation | Already installed. Use `format`, `subHours`, `subDays`, `formatDistanceToNow`. |
| @fortawesome/free-solid-svg-icons | 6.7.x | KPI card icons: faCoins, faNetworkWired, faDollarSign, faStopwatch, faDownload | Already installed. |

### Supporting (No New Dependencies Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | 2.1.1 + 3.5.0 | cn() utility for conditional classes | Already available via `@/lib/utils`. |

**No new npm packages or gems required for this phase.**

## Architecture Patterns

### Recommended Project Structure
```
source/dashboard/
  app/
    services/
      usage_service.rb          # Extended with 4 new aggregation methods
    controllers/api/v1/
      usage_controller.rb       # Extended with summary + charts actions
    views/api/v1/usage/
      index.json.jbuilder       # Existing (raw records)
      summary.json.jbuilder     # NEW: KPI data with trends
      charts.json.jbuilder      # NEW: All 4 chart datasets
    frontend/
      components/
        usage/
          UsageKpiCards.tsx      # 4 KPI cards row
          UsageTimePeriod.tsx    # Time period selector button group
          TokenUsageChart.tsx    # Stacked area chart
          CostBreakdownChart.tsx # Donut chart
          ApiCallsChart.tsx      # Horizontal bar chart
          LatencyChart.tsx       # Histogram
          ChartCard.tsx          # Reusable chart wrapper (Card + title + 3-dot menu)
          ExportButton.tsx       # CSV download button
        pages/
          UsagePage.tsx          # Composed page (replaces placeholder)
      hooks/
        useUsage.ts             # Extended with useUsageSummary and useUsageCharts
      lib/
        csvExport.ts            # Client-side CSV generation utility
      types/
        api.ts                  # Extended UsageRecord + new aggregation types
```

### Pattern 1: Server-Side Aggregation via SQL GROUP BY
**What:** All data aggregation happens in UsageService using PostgreSQL GROUP BY. The API returns pre-shaped data that Recharts can consume directly.
**When to use:** Always for this phase -- per D-04, avoid sending raw records to frontend.
**Example:**
```ruby
# Source: Existing project pattern (DashboardService, UsageService)
def self.by_agent_over_time(from:, to:, granularity: 'hour')
  trunc = granularity == 'hour' ? 'hour' : 'day'
  UsageRecord
    .joins(:agent)
    .where(recorded_at: from..to)
    .group("date_trunc('#{trunc}', recorded_at)", 'agents.name', 'agents.id')
    .order(Arel.sql("date_trunc('#{trunc}', recorded_at)"))
    .pluck(
      Arel.sql("date_trunc('#{trunc}', recorded_at) AS bucket"),
      'agents.name',
      'agents.id',
      Arel.sql('SUM(input_tokens + output_tokens) AS total_tokens')
    )
end
```

### Pattern 2: Trend Calculation (Current vs Previous Period)
**What:** For KPI trend indicators, compare the current period totals against the equivalent previous period. E.g., if viewing "24h", compare last 24h vs the 24h before that.
**When to use:** USAG-01 KPI cards.
**Example:**
```ruby
# Calculate percentage change
def self.summary_with_trends(from:, to:)
  duration = to - from
  prev_from = from - duration
  prev_to = from

  current = summary(from: from, to: to)
  previous = summary(from: prev_from, to: prev_to)

  current.merge(
    token_trend: percent_change(previous[:total_tokens], current[:total_tokens]),
    api_calls_trend: percent_change(previous[:total_api_calls], current[:total_api_calls]),
    cost_trend: percent_change(previous[:total_cost_cents], current[:total_cost_cents]),
    latency_trend: percent_change(previous[:avg_latency_ms], current[:avg_latency_ms])
  )
end

def self.percent_change(old_val, new_val)
  return nil if old_val.nil? || old_val.zero?
  ((new_val - old_val).to_f / old_val * 100).round(1)
end
```

### Pattern 3: Recharts Chart Component with ResponsiveContainer
**What:** Each chart is a standalone component that receives typed data props and renders inside ResponsiveContainer.
**When to use:** All 4 chart components.
**Example:**
```typescript
// Stacked area chart pattern
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const CHART_COLORS = [
  "var(--color-chart-1)", // #00d4aa
  "var(--color-chart-2)", // #3b82f6
  "var(--color-chart-3)", // #8b5cf6
  "var(--color-chart-4)", // #f43f5e
  "var(--color-chart-5)", // #f59e0b
];

interface TokenUsageChartProps {
  data: Array<{ bucket: string; [agentName: string]: number | string }>;
  agents: string[];
}

export function TokenUsageChart({ data, agents }: TokenUsageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="bucket" stroke="var(--color-text-secondary)" />
        <YAxis stroke="var(--color-text-secondary)" />
        <Tooltip />
        <Legend />
        {agents.map((agent, i) => (
          <Area
            key={agent}
            type="monotone"
            dataKey={agent}
            stackId="tokens"
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 4: Donut Chart (PieChart with innerRadius)
**What:** PieChart with innerRadius creates the donut effect. Use Cell for individual segment colors.
**Example:**
```typescript
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CostBreakdownChartProps {
  data: Array<{ name: string; value: number }>;
}

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 5: Horizontal Bar Chart (BarChart layout="vertical")
**What:** Setting `layout="vertical"` on BarChart orients bars horizontally. XAxis becomes `type="number"` and YAxis becomes `type="category"`.
**Example:**
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ApiCallsChartProps {
  data: Array<{ endpoint: string; calls: number }>;
}

export function ApiCallsChart({ data }: ApiCallsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis type="number" stroke="var(--color-text-secondary)" />
        <YAxis
          type="category"
          dataKey="endpoint"
          stroke="var(--color-text-secondary)"
          width={180}
        />
        <Tooltip />
        <Bar dataKey="calls" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 6: Histogram (BarChart with Bucket Ranges)
**What:** A histogram is a BarChart where the X axis shows latency ranges (buckets) and the Y axis shows frequency counts. The backend pre-computes buckets.
**Example:**
```ruby
# Backend bucketing
def self.latency_distribution(from:, to:)
  buckets = [0, 100, 200, 300, 400, 500, 750, 1000, Float::INFINITY]
  scope = UsageRecord.where(recorded_at: from..to).where.not(latency_ms: nil)

  buckets.each_cons(2).map do |low, high|
    label = high == Float::INFINITY ? "#{low}ms+" : "#{low}-#{high}ms"
    count = if high == Float::INFINITY
              scope.where('latency_ms >= ?', low).count
            else
              scope.where(latency_ms: low...high).count
            end
    { range: label, count: count }
  end
end
```

### Pattern 7: Client-Side CSV Export
**What:** Generate CSV string from data, create Blob, trigger download via temporary anchor element.
**Example:**
```typescript
// Source: Native browser Blob API
export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

### Anti-Patterns to Avoid
- **Client-side aggregation of raw records:** Per D-04, never send all usage_records to frontend and aggregate in JS. SQL GROUP BY is orders of magnitude faster and reduces payload size.
- **Separate API call per chart:** Use a single `/api/v1/usage/charts` endpoint that returns all 4 chart datasets in one response. Avoids waterfall requests.
- **Hardcoded agent colors:** Use the CSS custom property array (`--color-chart-1` through `--color-chart-5`) and cycle by index. Supports any number of agents.
- **Manual Recharts sizing:** Always use `ResponsiveContainer` rather than fixed width/height. The existing Sparkline component demonstrates this pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data aggregation | Custom JS reduce/groupBy | SQL GROUP BY in UsageService | PostgreSQL handles millions of rows in milliseconds; JS would choke on large datasets and waste bandwidth |
| CSV generation | npm csv library | Native Blob + URL.createObjectURL | D-07 mandates no additional library. Simple tabular data needs no library -- 15 lines of code |
| Chart rendering | Custom SVG/Canvas | Recharts 3.8.1 (already installed) | Tooltips, legends, responsiveness, animations all handled |
| Time range calculation | Manual Date arithmetic | date-fns subHours/subDays | Edge cases (DST, month boundaries) handled correctly |
| Number formatting | Custom formatters | Intl.NumberFormat | Native browser API handles compact notation (42.8M), currency ($842.50), percentages |

**Key insight:** This phase is a composition exercise -- assembling pre-built pieces (Recharts, TanStack Query, SQL aggregation) rather than building custom infrastructure. The only new logic is the aggregation SQL queries and the page composition.

## Common Pitfalls

### Pitfall 1: Recharts ResponsiveContainer Requires Fixed Parent Height
**What goes wrong:** Charts render as zero-height if their parent container has no explicit height.
**Why it happens:** ResponsiveContainer calculates dimensions from its parent. If the parent is `height: auto`, the chart collapses.
**How to avoid:** The `ChartCard` wrapper must set a fixed height on the chart container (e.g., `h-[300px]` or `h-72`).
**Warning signs:** Charts render but are invisible; no console errors.

### Pitfall 2: Stacked Area Chart Data Shape Must Be Pivoted
**What goes wrong:** If the API returns `[{agent: "A", bucket: "10:00", tokens: 100}, {agent: "B", bucket: "10:00", tokens: 200}]`, Recharts cannot stack it.
**Why it happens:** Recharts AreaChart expects pivoted data: `[{bucket: "10:00", "Agent A": 100, "Agent B": 200}]` where each agent is a separate key.
**How to avoid:** Either pivot server-side in the jbuilder view, or transform in the frontend hook. Server-side is cleaner.
**Warning signs:** Each agent renders as its own separate area instead of stacking.

### Pitfall 3: PieChart innerRadius/outerRadius Percentage vs Pixel
**What goes wrong:** Using percentage strings like `"60%"` for innerRadius can produce unexpected donut sizes on different viewports.
**Why it happens:** Percentage-based radii calculate from the chart's maxRadius, which varies with container size.
**How to avoid:** Use pixel values for innerRadius (60) and outerRadius (100), or test carefully with percentages at different breakpoints.
**Warning signs:** Donut appears as a full pie on small screens or has a huge hole on large screens.

### Pitfall 4: Horizontal BarChart Axis Confusion
**What goes wrong:** Setting `layout="vertical"` but keeping XAxis as `type="category"` produces a broken chart.
**Why it happens:** In Recharts, `layout="vertical"` means bars are horizontal, but it inverts which axis is category vs number. The XAxis must be `type="number"` and YAxis must be `type="category"`.
**How to avoid:** Always set `<XAxis type="number" />` and `<YAxis type="category" dataKey="endpoint" />` when using `layout="vertical"`.
**Warning signs:** Bars don't render; no error in console.

### Pitfall 5: Time Zone Mismatch in Trend Calculations
**What goes wrong:** "Last 24h" calculated in UTC yields different results than user's local timezone.
**Why it happens:** Rails `Time.current` uses the configured timezone, but frontend `new Date()` uses browser timezone.
**How to avoid:** Always send ISO 8601 timestamps from the frontend and parse with `Time.zone.parse` in Rails. The existing `useUsage` hook already sends `from`/`to` as ISO strings.
**Warning signs:** Trend percentages seem wrong; boundary records included/excluded unexpectedly.

### Pitfall 6: Recharts Tooltip Styling in Dark Theme
**What goes wrong:** Default Recharts Tooltip has a white background, unreadable against the dark dashboard.
**Why it happens:** Recharts default styles assume a light theme.
**How to avoid:** Pass `contentStyle` and `labelStyle` to the Tooltip component to match the dark theme.
**Warning signs:** Bright white tooltip box appears on hover.

### Pitfall 7: CSV Export Escaping
**What goes wrong:** Values containing commas or quotes break CSV format.
**Why it happens:** Naive `value.join(",")` doesn't handle special characters.
**How to avoid:** Wrap each cell in double quotes and escape internal double quotes by doubling them: `"${cell.replace(/"/g, '""')}"`.
**Warning signs:** CSV opens with misaligned columns in Excel/Sheets.

## Code Examples

### Recharts Dark Theme Tooltip
```typescript
// Custom tooltip styling to match dark theme
const darkTooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    color: "var(--color-text-primary)",
  },
  labelStyle: {
    color: "var(--color-text-secondary)",
  },
};

// Usage in any chart:
<Tooltip {...darkTooltipStyle} />
```

### Time Range to Date Conversion
```typescript
// Convert usageTimeRange to from/to ISO strings
import { subHours, subDays } from "date-fns";

function getTimeRange(range: "1h" | "6h" | "24h" | "7d" | "30d") {
  const now = new Date();
  const rangeMap: Record<string, Date> = {
    "1h": subHours(now, 1),
    "6h": subHours(now, 6),
    "24h": subHours(now, 24),
    "7d": subDays(now, 7),
    "30d": subDays(now, 30),
  };
  return {
    from: rangeMap[range].toISOString(),
    to: now.toISOString(),
  };
}
```

### Granularity Selection Based on Time Range
```typescript
// Select appropriate granularity for chart bucketing
function getGranularity(range: "1h" | "6h" | "24h" | "7d" | "30d"): "hour" | "day" {
  return range === "7d" || range === "30d" ? "day" : "hour";
}
```

### Number Formatting for KPI Values
```typescript
// Format large numbers compactly: 42800000 -> "42.8M"
function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// Format cents to dollars: 84250 -> "$842.50"
function formatCost(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// Format latency: 1800 -> "1.8s"
function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}
```

### Pivoting Aggregated Data for Stacked Area Chart
```typescript
// Transform API response into Recharts-compatible pivoted format
// Input: [{bucket: "2026-03-27T10:00", agent_name: "docs-writer", total_tokens: 5000}, ...]
// Output: [{bucket: "10:00", "docs-writer": 5000, "code-reviewer": 3000}, ...]

interface TimeSeriesPoint {
  bucket: string;
  agent_name: string;
  total_tokens: number;
}

function pivotTimeSeries(
  data: TimeSeriesPoint[]
): Array<Record<string, string | number>> {
  const grouped = new Map<string, Record<string, string | number>>();

  for (const point of data) {
    if (!grouped.has(point.bucket)) {
      grouped.set(point.bucket, { bucket: point.bucket });
    }
    grouped.get(point.bucket)![point.agent_name] = point.total_tokens;
  }

  return Array.from(grouped.values());
}
```

### API Endpoint Structure
```ruby
# routes.rb addition
resources :usage, only: [:index] do
  collection do
    get :summary
    get :charts
  end
end

# Produces:
# GET /api/v1/usage          (existing - raw records)
# GET /api/v1/usage/summary  (new - KPI data with trends)
# GET /api/v1/usage/charts   (new - all 4 chart datasets)
```

### jbuilder View for Charts Response
```ruby
# views/api/v1/usage/charts.json.jbuilder
json.token_usage_over_time do
  json.array! @charts[:token_usage] do |point|
    json.bucket point[:bucket].iso8601
    json.agent_name point[:agent_name]
    json.total_tokens point[:total_tokens]
  end
end

json.cost_by_agent do
  json.array! @charts[:cost_by_agent] do |point|
    json.name point[:agent_name]
    json.value point[:cost_cents]
  end
end

json.calls_by_endpoint do
  json.array! @charts[:calls_by_endpoint] do |point|
    json.endpoint point[:endpoint]
    json.calls point[:total_calls]
  end
end

json.latency_distribution do
  json.array! @charts[:latency_distribution] do |bucket|
    json.range bucket[:range]
    json.count bucket[:count]
  end
end
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts 2.x `ResponsiveContainer` required explicit parent height | Recharts 3.x same requirement persists | v3 (2024) | Still need explicit height on parent |
| Recharts 2.x Tooltip default styling | Recharts 3.x same default (white background) | v3 (2024) | Still need custom contentStyle for dark themes |
| `date-fns` v3 tree-shaking via subpath imports | `date-fns` v4 direct imports from "date-fns" | v4 (2024) | Import `{ subHours }` from "date-fns" directly |
| Blob + createObjectURL for CSV | Same pattern, well-supported in all modern browsers | Stable | No library needed |

**Deprecated/outdated:**
- Recharts `isAnimationActive` default changed in v3 to `true` -- explicitly set `false` for sparklines/small charts but `true` for dashboard charts (animations add polish)
- Avoid `moment.js` for date formatting -- project uses `date-fns` 4.1.0

## Open Questions

1. **Pivot data server-side or client-side?**
   - What we know: Recharts stacked area needs pivoted data where each agent is a key. The backend returns flat rows (bucket, agent_name, total_tokens).
   - What's unclear: Whether to pivot in jbuilder view or in the frontend hook.
   - Recommendation: Pivot in the frontend hook (cleaner separation -- API returns normalized data, client reshapes for rendering). This keeps the API response shape simple and reusable.

2. **Single charts endpoint vs multiple?**
   - What we know: D-04 says "add new API endpoint(s) or extend existing". Charts need different time ranges.
   - What's unclear: Whether one `/usage/charts?from=...&to=...` returning all 4 datasets is better than 4 separate endpoints.
   - Recommendation: Single `/usage/charts` endpoint. All 4 datasets share the same time range filter, so one request is simpler and avoids waterfall. The response payload is small (aggregated data, not raw records).

3. **Granularity auto-selection**
   - What we know: 1h/6h/24h ranges should use hourly buckets; 7d/30d should use daily buckets.
   - What's unclear: Whether granularity should be a frontend param or backend auto-detect.
   - Recommendation: Frontend sends `granularity` param based on time range. Backend uses `date_trunc('hour'|'day', recorded_at)` accordingly. This keeps the logic explicit and testable.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | RSpec 8.0.4 |
| Config file | `source/dashboard/.rspec` + `spec/rails_helper.rb` |
| Quick run command | `cd source/dashboard && bundle exec rspec spec/services/usage_service_spec.rb spec/requests/api/v1/usage_spec.rb --format progress` |
| Full suite command | `cd source/dashboard && bundle exec rspec --format progress` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| USAG-01 | KPI summary with trends (total tokens, api calls, cost, avg latency) | unit | `bundle exec rspec spec/services/usage_service_spec.rb -x` | Exists -- needs new examples for avg_latency_ms, trends |
| USAG-02 | Token usage grouped by agent over time | unit | `bundle exec rspec spec/services/usage_service_spec.rb -x` | Exists -- needs new describe block for by_agent_over_time |
| USAG-03 | Cost breakdown grouped by agent | unit | `bundle exec rspec spec/services/usage_service_spec.rb -x` | Exists -- needs new describe block for cost_by_agent |
| USAG-04 | API calls grouped by endpoint | unit | `bundle exec rspec spec/services/usage_service_spec.rb -x` | Exists -- needs new describe block for calls_by_endpoint |
| USAG-05 | Latency distribution buckets | unit | `bundle exec rspec spec/services/usage_service_spec.rb -x` | Exists -- needs new describe block for latency_distribution |
| USAG-06 | Time period filter on API endpoints | integration | `bundle exec rspec spec/requests/api/v1/usage_spec.rb -x` | Exists -- needs new describe blocks for summary and charts |
| USAG-07 | Export endpoint data (CSV generated client-side) | manual-only | N/A -- CSV logic is pure frontend JS | N/A |

### Sampling Rate
- **Per task commit:** `cd source/dashboard && bundle exec rspec spec/services/usage_service_spec.rb spec/requests/api/v1/usage_spec.rb --format progress`
- **Per wave merge:** `cd source/dashboard && bundle exec rspec --format progress`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `spec/services/usage_service_spec.rb` -- needs new describe blocks for `by_agent_over_time`, `cost_by_agent`, `calls_by_endpoint`, `latency_distribution`, `summary_with_trends`
- [ ] `spec/requests/api/v1/usage_spec.rb` -- needs new describe blocks for `GET /api/v1/usage/summary` and `GET /api/v1/usage/charts`
- [ ] `spec/factories/usage_records.rb` -- needs `latency_ms` and `endpoint` attributes added after migration
- [ ] `spec/models/usage_record_spec.rb` -- needs validation tests for new columns if any validations are added

## Sources

### Primary (HIGH confidence)
- Recharts 3.8.1 installed in project -- verified exports via `require('recharts')` in Node
- Recharts AreaChart API: [https://recharts.github.io/en-US/api/AreaChart/](https://recharts.github.io/en-US/api/AreaChart/) -- stackOffset, stackId props
- Recharts PieChart API: [https://recharts.github.io/en-US/api/PieChart/](https://recharts.github.io/en-US/api/PieChart/) -- innerRadius for donut
- Recharts BarChart API: [https://recharts.github.io/en-US/api/BarChart/](https://recharts.github.io/en-US/api/BarChart/) -- layout="vertical" for horizontal bars
- Existing project code: UsageService.summary, filterStore.usageTimeRange, Sparkline.tsx, AgentFilters.tsx -- all verified by reading source
- TEAM_MANAGER_SPEC.md Section 6 -- chart types, KPI card specs, color tokens
- CSS custom properties in application.css -- chart-1 through chart-5 color tokens verified

### Secondary (MEDIUM confidence)
- Recharts Stacked Area Chart example: [https://recharts.github.io/en-US/examples/StackedAreaChart/](https://recharts.github.io/en-US/examples/StackedAreaChart/)
- Client-side CSV generation: [https://riptutorial.com/javascript/example/24711/client-side-csv-download-using-blob](https://riptutorial.com/javascript/example/24711/client-side-csv-download-using-blob) -- Blob + createObjectURL pattern verified across multiple sources

### Tertiary (LOW confidence)
- None -- all findings verified against installed packages or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed and verified in node_modules
- Architecture: HIGH -- follows established project patterns (service objects, jbuilder views, TanStack Query hooks, component composition)
- Pitfalls: HIGH -- verified against Recharts API docs and existing Sparkline component behavior
- SQL aggregation: HIGH -- PostgreSQL date_trunc and GROUP BY are well-documented standard features
- CSV export: HIGH -- Blob/createObjectURL is a mature browser API pattern

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable stack, all dependencies already locked)
