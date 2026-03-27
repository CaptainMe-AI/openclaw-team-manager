import { Button } from "@/components/ui";
import { useFilterStore } from "@/stores/filterStore";

const statusOptions = ["All", "Active", "Idle", "Error", "Disabled"] as const;
const modelOptions = ["All", "Opus", "Sonnet"] as const;
const uptimeOptions = [
  { label: "All", value: "all" },
  { label: "> 1h", value: "1h" },
  { label: "> 24h", value: "24h" },
  { label: "> 7d", value: "7d" },
] as const;

interface AgentFiltersProps {
  uptimeThreshold: string;
  onUptimeChange: (value: string) => void;
}

export function AgentFilters({
  uptimeThreshold,
  onUptimeChange,
}: AgentFiltersProps) {
  const { agentFilters, setAgentFilters } = useFilterStore();
  const currentStatus = agentFilters.status ?? "all";
  const currentModel = agentFilters.llm_model ?? "all";

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Status filter group */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary font-normal mr-1">
          Status
        </span>
        {statusOptions.map((s) => {
          const value = s === "All" ? "all" : s.toLowerCase();
          return (
            <Button
              key={s}
              variant={currentStatus === value ? "primary" : "secondary"}
              size="sm"
              aria-pressed={currentStatus === value}
              onClick={() =>
                setAgentFilters({
                  ...agentFilters,
                  status: s === "All" ? undefined : s.toLowerCase(),
                })
              }
            >
              {s}
            </Button>
          );
        })}
      </div>

      {/* Vertical divider */}
      <div className="border-l border-border h-6" />

      {/* Model filter group */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary font-normal mr-1">
          Model
        </span>
        {modelOptions.map((m) => {
          const value = m === "All" ? "all" : m.toLowerCase();
          return (
            <Button
              key={m}
              variant={currentModel === value ? "primary" : "secondary"}
              size="sm"
              aria-pressed={currentModel === value}
              onClick={() =>
                setAgentFilters({
                  ...agentFilters,
                  llm_model: m === "All" ? undefined : m.toLowerCase(),
                })
              }
            >
              {m}
            </Button>
          );
        })}
      </div>

      {/* Vertical divider */}
      <div className="border-l border-border h-6" />

      {/* Uptime threshold group */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary font-normal mr-1">
          Uptime
        </span>
        {uptimeOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={uptimeThreshold === opt.value ? "primary" : "secondary"}
            size="sm"
            aria-pressed={uptimeThreshold === opt.value}
            onClick={() => onUptimeChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
