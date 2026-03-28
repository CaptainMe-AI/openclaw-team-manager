import { formatDistanceToNow } from "date-fns";
import { Table, Badge, type ColumnDef } from "@/components/ui";
import type { Approval } from "@/types/api";

interface ApprovalHistoryTableProps {
  approvals: Approval[];
}

const approvalTypeLabels: Record<Approval["approval_type"], string> = {
  dangerous_command: "Production Deployment",
  sensitive_data: "Tool Access Request",
  budget_override: "Budget Override",
};

const decisionColorMap: Record<string, "success" | "danger"> = {
  approved: "success",
  denied: "danger",
};

const decisionLabels: Record<string, string> = {
  approved: "Approved",
  denied: "Denied",
};

const columns: ColumnDef<Approval>[] = [
  {
    header: "Timestamp",
    accessor: (row) => (
      <span className="text-xs font-mono text-text-secondary">
        {row.resolved_at
          ? formatDistanceToNow(new Date(row.resolved_at), { addSuffix: true })
          : "\u2014"}
      </span>
    ),
    className: "w-40",
  },
  {
    header: "Agent",
    accessor: (row) => (
      <span className="text-sm text-text-primary">
        {row.agent_name || "Unknown"}
      </span>
    ),
    className: "w-32 hidden sm:table-cell",
  },
  {
    header: "Action",
    accessor: (row) => (
      <span className="text-sm text-text-primary">
        {approvalTypeLabels[row.approval_type]}
      </span>
    ),
    className: "w-40",
  },
  {
    header: "Decision",
    accessor: (row) => (
      <Badge variant="status" color={decisionColorMap[row.status] || "idle"}>
        {decisionLabels[row.status] || row.status}
      </Badge>
    ),
    className: "w-28",
  },
  {
    header: "Decided By",
    accessor: (row) => (
      <span className="text-sm text-text-secondary">
        {row.resolved_by_name || "\u2014"}
      </span>
    ),
    className: "hidden md:table-cell",
  },
];

export function ApprovalHistoryTable({ approvals }: ApprovalHistoryTableProps) {
  return <Table columns={columns} data={approvals} />;
}
