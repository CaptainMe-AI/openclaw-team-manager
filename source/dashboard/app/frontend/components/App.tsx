import { Button, Card, Badge, Table, Input, StatusDot, type ColumnDef } from "@/components/ui";

interface TaskRow {
  name: string;
  status: string;
  statusColor: "success" | "danger" | "warning" | "info" | "idle";
  duration: string;
  timestamp: string;
}

const sampleData: TaskRow[] = [
  { name: "Deploy ML Pipeline", status: "Active", statusColor: "success", duration: "2h 15m", timestamp: "2 min ago" },
  { name: "Update Dependencies", status: "Completed", statusColor: "success", duration: "45m", timestamp: "1h ago" },
  { name: "Security Audit", status: "Failed", statusColor: "danger", duration: "4h 30m", timestamp: "3h ago" },
];

const columns: ColumnDef<TaskRow>[] = [
  { header: "Name", accessor: "name", align: "left" },
  {
    header: "Status",
    accessor: (row) => <Badge color={row.statusColor}>{row.status}</Badge>,
    align: "left",
  },
  { header: "Duration", accessor: "duration", align: "right", className: "font-mono text-text-secondary text-xs" },
  { header: "Timestamp", accessor: "timestamp", align: "right", className: "font-mono text-text-secondary text-xs" },
];

const statuses = ["active", "success", "idle", "error", "danger", "warning", "info", "offline"] as const;

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-xl font-semibold text-text-primary mb-2">Design System</h1>
      <p className="text-sm text-text-secondary mb-8">Component library and theme tokens for OpenClaw Command Center</p>

      {/* StatusDot */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">StatusDot</h2>
        <div className="flex flex-wrap items-center gap-4">
          {statuses.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <StatusDot status={s} size="sm" />
              <StatusDot status={s} size="md" />
              <span className="text-xs text-text-secondary">{s}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <StatusDot status="active" size="md" pulse />
            <span className="text-xs text-text-secondary">pulse</span>
          </div>
        </div>
      </section>

      {/* Badge */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Badge</h2>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Badge color="success" dot>Active</Badge>
          <Badge color="danger">Error</Badge>
          <Badge color="idle">Idle</Badge>
          <Badge color="warning">Waiting</Badge>
          <Badge color="info">In Progress</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="priority" priority="p0">P0 Critical</Badge>
          <Badge variant="priority" priority="p1">P1 High</Badge>
          <Badge variant="priority" priority="p2">P2 Medium</Badge>
          <Badge variant="priority" priority="p3">P3 Low</Badge>
        </div>
      </section>

      {/* Card */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Card</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-2">KPI Card Example</h3>
            <p className="text-2xl font-mono font-bold text-text-primary">1,247</p>
            <p className="text-xs text-text-secondary mt-1">Total tasks completed this week</p>
          </Card>
          <Card variant="glow">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Panel Example</h3>
            <p className="text-sm text-text-secondary">This card uses the glow variant with a subtle box-shadow for emphasis on important panels.</p>
          </Card>
        </div>
      </section>

      {/* Button */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Button</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">New Task</Button>
          <Button variant="primary" glow>Approve All</Button>
          <Button variant="secondary">Discard Changes</Button>
          <Button variant="danger">Deny</Button>
          <Button variant="ghost">Clear</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      {/* Input */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Input</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <Input label="Display Name" placeholder="Enter display name..." />
          <Input
            icon={<span className="text-sm">&#x1F50D;</span>}
            placeholder="Search agents, tasks, or approvals..."
          />
          <Input
            label="Budget Limit"
            error="Value must be between 1 and 100"
            defaultValue="250"
          />
        </div>
      </section>

      {/* Table */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Table</h2>
        <Card padding={false}>
          <Table columns={columns} data={sampleData} />
        </Card>
      </section>

      {/* Responsive note */}
      <p className="text-xs text-text-secondary mt-8">Resize browser to test responsive behavior. Table scrolls horizontally on narrow viewports.</p>
    </div>
  );
}
