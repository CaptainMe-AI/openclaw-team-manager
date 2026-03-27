import { Button } from "@/components/ui";
import { useFilterStore } from "@/stores/filterStore";
import { useAgents } from "@/hooks/useAgents";

interface TaskFiltersProps {
  timePeriod: string;
  onTimePeriodChange: (period: string) => void;
}

const priorityOptions = [
  { label: "All", value: undefined },
  { label: "P0", value: 0 },
  { label: "P1", value: 1 },
  { label: "P2", value: 2 },
  { label: "P3", value: 3 },
] as const;

const timePeriodOptions = [
  { label: "All", value: "all" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
] as const;

export function TaskFilters({
  timePeriod,
  onTimePeriodChange,
}: TaskFiltersProps) {
  const { taskFilters, setTaskFilters } = useFilterStore();
  const { data: agentsData } = useAgents({ per_page: 100 });
  const agents = agentsData?.data ?? [];
  const displayAgents = agents.slice(0, 5);

  const currentAgentId = taskFilters.agent_id ?? undefined;
  const currentPriority = taskFilters.priority;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Agent filter group */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-secondary font-semibold">
          Agent
        </span>
        <Button
          variant={currentAgentId === undefined ? "primary" : "secondary"}
          size="sm"
          aria-pressed={currentAgentId === undefined}
          onClick={() =>
            setTaskFilters({ ...taskFilters, agent_id: undefined })
          }
        >
          All
        </Button>
        {displayAgents.map((agent) => (
          <Button
            key={agent.id}
            variant={currentAgentId === agent.id ? "primary" : "secondary"}
            size="sm"
            aria-pressed={currentAgentId === agent.id}
            onClick={() =>
              setTaskFilters({ ...taskFilters, agent_id: agent.id })
            }
          >
            {agent.name}
          </Button>
        ))}
      </div>

      {/* Vertical divider */}
      <div className="border-l border-border h-6" />

      {/* Priority filter group */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-secondary font-semibold">
          Priority
        </span>
        {priorityOptions.map((opt) => (
          <Button
            key={opt.label}
            variant={currentPriority === opt.value ? "primary" : "secondary"}
            size="sm"
            aria-pressed={currentPriority === opt.value}
            onClick={() =>
              setTaskFilters({ ...taskFilters, priority: opt.value })
            }
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Vertical divider */}
      <div className="border-l border-border h-6" />

      {/* Time period filter group */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-secondary font-semibold">
          Period
        </span>
        {timePeriodOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={timePeriod === opt.value ? "primary" : "secondary"}
            size="sm"
            aria-pressed={timePeriod === opt.value}
            onClick={() => onTimePeriodChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
