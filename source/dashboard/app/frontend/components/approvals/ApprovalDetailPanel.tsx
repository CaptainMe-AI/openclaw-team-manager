import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import type { Approval } from "@/types/api";

interface ApprovalDetailPanelProps {
  approval: Approval;
}

const approvalTypeLabels: Record<Approval["approval_type"], string> = {
  dangerous_command: "Production Deployment",
  sensitive_data: "Tool Access Request",
  budget_override: "Budget Override",
};

function classificationColor(
  classification: string,
): "danger" | "warning" | "info" {
  if (classification === "restricted" || classification === "secret") {
    return "danger";
  }
  if (classification === "internal") {
    return "warning";
  }
  return "info";
}

function DangerousCommandContext({ context }: { context: Record<string, unknown> }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-text-secondary mb-1">Command</p>
        <code className="block text-xs font-mono text-text-primary bg-background/50 p-2 rounded break-all">
          {context.command as string}
        </code>
      </div>
      <div>
        <p className="text-xs text-text-secondary mb-1">Directory</p>
        <span className="text-xs font-mono text-text-secondary">
          {context.working_directory as string}
        </span>
      </div>
    </div>
  );
}

function SensitiveDataContext({ context }: { context: Record<string, unknown> }) {
  const classification = (context.classification as string) || "internal";
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-text-secondary mb-1">File Path</p>
        <span className="text-xs font-mono text-text-primary">
          {context.file_path as string}
        </span>
      </div>
      <div>
        <p className="text-xs text-text-secondary mb-1">Classification</p>
        <Badge variant="status" color={classificationColor(classification)}>
          {classification}
        </Badge>
      </div>
    </div>
  );
}

function BudgetOverrideContext({ context }: { context: Record<string, unknown> }) {
  const currentCents = (context.current_limit_cents as number) || 0;
  const requestedCents = (context.requested_limit_cents as number) || 0;
  const isOverBudget = requestedCents > currentCents * 2;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-text-secondary mb-1">Current Limit</p>
        <span className="text-xs font-mono text-text-primary">
          ${(currentCents / 100).toFixed(2)}
        </span>
      </div>
      <div>
        <p className="text-xs text-text-secondary mb-1">Requested Limit</p>
        <span
          className={cn(
            "text-xs font-mono",
            isOverBudget ? "text-warning" : "text-text-primary",
          )}
        >
          ${(requestedCents / 100).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function ContextDetails({ approval }: { approval: Approval }) {
  switch (approval.approval_type) {
    case "dangerous_command":
      return <DangerousCommandContext context={approval.context} />;
    case "sensitive_data":
      return <SensitiveDataContext context={approval.context} />;
    case "budget_override":
      return <BudgetOverrideContext context={approval.context} />;
    default: {
      const _exhaustive: never = approval.approval_type;
      void _exhaustive;
      return null;
    }
  }
}

export function ApprovalDetailPanel({ approval }: ApprovalDetailPanelProps) {
  void approvalTypeLabels;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left column: Agent Reasoning */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Agent Reasoning
          </h4>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">
            {approval.description || "No reasoning provided."}
          </p>
        </div>

        {/* Right column: Context Details */}
        <div className="md:col-span-2">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Context Details
          </h4>
          <ContextDetails approval={approval} />
        </div>
      </div>
    </div>
  );
}
