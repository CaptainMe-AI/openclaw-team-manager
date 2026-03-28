import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useApprovals, useBatchApprove } from "@/hooks/useApprovals";
import { useFilterStore } from "@/stores/filterStore";
import { Button } from "@/components/ui";
import { ApprovalCard } from "@/components/approvals/ApprovalCard";
import { ApprovalFilters } from "@/components/approvals/ApprovalFilters";
import { ApprovalHistoryTable } from "@/components/approvals/ApprovalHistoryTable";

function SkeletonCards() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface rounded-lg border border-border p-4 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-surface-hover/50 rounded h-3 w-3" />
            <div className="bg-surface-hover/50 rounded h-4 w-16" />
            <div className="bg-surface-hover/50 rounded h-4 w-48" />
          </div>
          <div className="flex items-center justify-between">
            <div className="bg-surface-hover/50 rounded h-3 w-24" />
            <div className="flex gap-2">
              <div className="bg-surface-hover/50 rounded h-6 w-16" />
              <div className="bg-surface-hover/50 rounded h-6 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-surface rounded-lg border border-border p-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-hover/50 rounded w-full mb-3"
        />
      ))}
    </div>
  );
}

export function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { approvalFilters, resetApprovalFilters } = useFilterStore();
  void resetApprovalFilters;

  // Pending approvals query
  const {
    data: pendingData,
    isLoading: pendingLoading,
    isError: pendingError,
    refetch: refetchPending,
  } = useApprovals({
    status: "pending",
    risk_level: approvalFilters.risk_level,
    per_page: 100,
    sort: "requested_at",
    dir: sortDir,
  });

  // History approvals query (all, then client-side filter to non-pending)
  const {
    data: historyData,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useApprovals({
    per_page: 100,
  });

  const pendingApprovals = pendingData?.data ?? [];
  const historyApprovals = (historyData?.data ?? []).filter(
    (a) => a.status === "approved" || a.status === "denied",
  );
  const pendingCount = pendingApprovals.length;

  const batchApprove = useBatchApprove();

  function handleBatchApprove() {
    const ids = pendingApprovals.map((a) => a.id);
    batchApprove.mutate(ids, {
      onSuccess: (data) => {
        toast.success(`${data.approved} approvals granted`);
        setExpandedId(null);
      },
      onError: () => {
        toast.error("Failed to process batch approval");
      },
    });
  }

  function toggleExpanded(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleSortToggle() {
    setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
  }

  return (
    <div>
      {/* Page header */}
      <h1 className="text-xl font-semibold text-text-primary">Approvals</h1>
      <p className="text-sm text-text-secondary mt-1">
        Manage pending requests and review historical decisions.
      </p>

      {/* Header row: tabs on left, Approve All button on right */}
      <div className="flex items-center justify-between mt-6">
        {/* Tab navigation */}
        <div className="flex border-b border-border" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "pending"}
            aria-controls="panel-pending"
            className={cn(
              "px-4 py-2 text-sm border-b-2 transition-colors",
              activeTab === "pending"
                ? "border-accent text-text-primary font-semibold"
                : "border-transparent text-text-secondary font-normal hover:text-text-primary",
            )}
            onClick={() => setActiveTab("pending")}
          >
            Pending ({pendingCount})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "history"}
            aria-controls="panel-history"
            className={cn(
              "px-4 py-2 text-sm border-b-2 transition-colors",
              activeTab === "history"
                ? "border-accent text-text-primary font-semibold"
                : "border-transparent text-text-secondary font-normal hover:text-text-primary",
            )}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>

        {/* Approve All button (pending tab only) */}
        {activeTab === "pending" && (
          <Button
            variant="primary"
            onClick={handleBatchApprove}
            disabled={pendingCount === 0 || batchApprove.isPending}
            aria-label={`Approve all ${pendingCount} pending approvals`}
          >
            {batchApprove.isPending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Processing...
              </>
            ) : (
              `Approve All (${pendingCount})`
            )}
          </Button>
        )}
      </div>

      {/* Filters (pending tab only) */}
      {activeTab === "pending" && (
        <div className="mt-4">
          <ApprovalFilters sortDir={sortDir} onSortToggle={handleSortToggle} />
        </div>
      )}

      {/* Pending tab panel */}
      {activeTab === "pending" && (
        <div
          id="panel-pending"
          role="tabpanel"
          aria-labelledby="tab-pending"
          tabIndex={0}
          className="mt-4"
        >
          {pendingLoading && <SkeletonCards />}

          {pendingError && (
            <div className="flex flex-col items-center justify-center py-16">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-danger opacity-50 mb-4"
                style={{ fontSize: 48 }}
              />
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Failed to load approvals
              </h2>
              <p className="text-sm text-text-secondary max-w-md text-center mb-6">
                Unable to fetch approval data from the server. Check that the
                Rails server is running and try again.
              </p>
              <Button variant="primary" onClick={() => refetchPending()}>
                Retry
              </Button>
            </div>
          )}

          {!pendingLoading && !pendingError && pendingApprovals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="text-text-secondary opacity-50 mb-4"
                style={{ fontSize: 48 }}
              />
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                No pending approvals
              </h2>
              <p className="text-sm text-text-secondary max-w-md text-center mb-6">
                All approval requests have been processed. New requests from
                agents will appear here.
              </p>
            </div>
          )}

          {!pendingLoading &&
            !pendingError &&
            pendingApprovals.length > 0 && (
              <div className="flex flex-col gap-3">
                {pendingApprovals.map((approval) => (
                  <ApprovalCard
                    key={approval.id}
                    approval={approval}
                    isExpanded={expandedId === approval.id}
                    onToggleExpand={() => toggleExpanded(approval.id)}
                  />
                ))}
              </div>
            )}
        </div>
      )}

      {/* History tab panel */}
      {activeTab === "history" && (
        <div
          id="panel-history"
          role="tabpanel"
          aria-labelledby="tab-history"
          tabIndex={0}
          className="mt-4"
        >
          {historyLoading && <SkeletonTable />}

          {historyError && (
            <div className="flex flex-col items-center justify-center py-16">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-danger opacity-50 mb-4"
                style={{ fontSize: 48 }}
              />
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Failed to load approvals
              </h2>
              <p className="text-sm text-text-secondary max-w-md text-center mb-6">
                Unable to fetch approval data from the server. Check that the
                Rails server is running and try again.
              </p>
              <Button variant="primary" onClick={() => refetchHistory()}>
                Retry
              </Button>
            </div>
          )}

          {!historyLoading &&
            !historyError &&
            historyApprovals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <FontAwesomeIcon
                  icon={faShieldHalved}
                  className="text-text-secondary opacity-50 mb-4"
                  style={{ fontSize: 48 }}
                />
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                  No approval history
                </h2>
                <p className="text-sm text-text-secondary max-w-md text-center mb-6">
                  Approved and denied requests will appear here once decisions
                  are made.
                </p>
              </div>
            )}

          {!historyLoading &&
            !historyError &&
            historyApprovals.length > 0 && (
              <ApprovalHistoryTable approvals={historyApprovals} />
            )}
        </div>
      )}
    </div>
  );
}
