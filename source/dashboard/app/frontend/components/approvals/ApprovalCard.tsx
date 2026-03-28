import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
  faRobot,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { useApproveApproval, useDenyApproval } from "@/hooks/useApprovals";
import { ApprovalDetailPanel } from "./ApprovalDetailPanel";
import type { Approval } from "@/types/api";

interface ApprovalCardProps {
  approval: Approval;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const riskColorMap: Record<
  Approval["risk_level"],
  "success" | "danger" | "warning" | "info" | "idle"
> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "idle",
};

const approvalTypeLabels: Record<Approval["approval_type"], string> = {
  dangerous_command: "Production Deployment",
  sensitive_data: "Tool Access Request",
  budget_override: "Budget Override",
};

export function ApprovalCard({
  approval,
  isExpanded,
  onToggleExpand,
}: ApprovalCardProps) {
  const approveMutation = useApproveApproval();
  const denyMutation = useDenyApproval();

  function handleApprove(e: React.MouseEvent) {
    e.stopPropagation();
    approveMutation.mutate(approval.id, {
      onSuccess: () => toast.success("Approval granted"),
      onError: () => toast.error("Failed to approve request"),
    });
  }

  function handleDeny(e: React.MouseEvent) {
    e.stopPropagation();
    denyMutation.mutate(approval.id, {
      onSuccess: () => toast.success("Approval denied"),
      onError: () => toast.error("Failed to deny request"),
    });
  }

  const isPending = approveMutation.isPending || denyMutation.isPending;

  return (
    <div
      className={cn(
        "bg-surface rounded-lg border p-4 cursor-pointer transition-colors",
        isExpanded
          ? "border-text-secondary"
          : "border-border hover:border-text-secondary",
      )}
      role="button"
      aria-expanded={isExpanded}
      aria-controls={`approval-detail-${approval.id}`}
      tabIndex={0}
      onClick={onToggleExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleExpand();
        }
      }}
    >
      {/* Row 1: Title, risk badge, type, time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FontAwesomeIcon
            icon={isExpanded ? faChevronDown : faChevronRight}
            className="text-xs text-text-secondary transition-transform duration-200"
          />
          <Badge variant="status" color={riskColorMap[approval.risk_level]}>
            {approval.risk_level.charAt(0).toUpperCase() +
              approval.risk_level.slice(1)}
          </Badge>
          <span className="text-sm font-semibold text-text-primary truncate">
            {approval.title}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-xs uppercase tracking-wider text-text-secondary">
            {approvalTypeLabels[approval.approval_type]}
          </span>
          <span className="text-xs font-mono text-text-secondary">
            {formatDistanceToNow(
              new Date(approval.requested_at || approval.created_at),
            )}
          </span>
        </div>
      </div>

      {/* Row 2: Agent info, approve/deny buttons */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <FontAwesomeIcon
            icon={faRobot}
            className="text-xs text-text-secondary"
          />
          <span className="text-xs text-text-secondary">
            {approval.agent_name || "Unknown Agent"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="bg-success/10 text-success border border-success/20 hover:bg-success/20 px-3 py-1 text-xs rounded-md font-semibold transition-colors disabled:opacity-50"
            onClick={handleApprove}
            disabled={isPending}
            aria-label={`Approve ${approval.title}`}
          >
            {approveMutation.isPending ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              "Approve"
            )}
          </button>
          <button
            type="button"
            className="bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 px-3 py-1 text-xs rounded-md font-semibold transition-colors disabled:opacity-50"
            onClick={handleDeny}
            disabled={isPending}
            aria-label={`Deny ${approval.title}`}
          >
            {denyMutation.isPending ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              "Deny"
            )}
          </button>
        </div>
      </div>

      {/* Expanded detail panel */}
      {isExpanded && (
        <div id={`approval-detail-${approval.id}`}>
          <ApprovalDetailPanel approval={approval} />
        </div>
      )}
    </div>
  );
}
