import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortAmountDown,
  faSortAmountUp,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui";
import { useFilterStore } from "@/stores/filterStore";

interface ApprovalFiltersProps {
  sortDir: "asc" | "desc";
  onSortToggle: () => void;
}

const riskOptions = [
  { label: "All", value: undefined },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
] as const;

export function ApprovalFilters({
  sortDir,
  onSortToggle,
}: ApprovalFiltersProps) {
  const { approvalFilters, setApprovalFilters } = useFilterStore();
  const currentRisk = approvalFilters.risk_level ?? "all";

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Risk level filter group */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary font-normal mr-1">
          Risk Level
        </span>
        <div
          className="flex items-center gap-2"
          role="group"
          aria-label="Filter by risk level"
        >
          {riskOptions.map((opt) => {
            const isActive =
              opt.value === undefined
                ? currentRisk === "all"
                : currentRisk === opt.value;
            return (
              <Button
                key={opt.label}
                variant={isActive ? "primary" : "secondary"}
                size="sm"
                aria-pressed={isActive}
                onClick={() =>
                  setApprovalFilters({
                    ...approvalFilters,
                    risk_level: opt.value,
                  })
                }
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Vertical divider */}
      <div className="border-l border-border h-6" />

      {/* Sort toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary font-normal mr-1">
          Sort
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={onSortToggle}
          aria-label={
            sortDir === "desc" ? "Sorted: oldest first" : "Sorted: newest first"
          }
        >
          <FontAwesomeIcon
            icon={sortDir === "desc" ? faSortAmountDown : faSortAmountUp}
            className="mr-1.5"
          />
          {sortDir === "desc" ? "Oldest First" : "Newest First"}
        </Button>
      </div>
    </div>
  );
}
