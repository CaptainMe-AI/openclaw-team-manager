import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/ui";
import { ApprovalCard } from "@/components/approvals/ApprovalCard";
import type { Approval } from "@/types/api";

interface ActionRequiredProps {
  approvals: Approval[];
  isLoading: boolean;
}

function SkeletonActionRequired() {
  return (
    <Card>
      <div className="animate-pulse">
        <div className="bg-surface-hover/50 rounded h-4 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-hover/50 rounded h-20 w-full"
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <FontAwesomeIcon
        icon={faShieldHalved}
        className="text-text-secondary opacity-50 text-[32px]"
      />
      <p className="text-sm font-semibold text-text-primary mt-3">All clear</p>
      <p className="text-xs text-text-secondary mt-1">
        No pending approvals require your attention.
      </p>
    </div>
  );
}

export function ActionRequired({ approvals, isLoading }: ActionRequiredProps) {
  if (isLoading) {
    return <SkeletonActionRequired />;
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-primary mb-4">
        Action Required
      </h2>
      {approvals.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {approvals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              isExpanded={false}
              onToggleExpand={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
