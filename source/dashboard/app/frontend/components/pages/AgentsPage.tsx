import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useAgents } from "@/hooks/useAgents";
import { useFilterStore } from "@/stores/filterStore";
import { useViewStore } from "@/stores/viewStore";
import { Button } from "@/components/ui";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { AgentTable } from "@/components/agents/AgentTable";
import { AgentFilters } from "@/components/agents/AgentFilters";
import { AgentViewToggle } from "@/components/agents/AgentViewToggle";
import type { Agent } from "@/types/api";

function filterByUptime(agents: Agent[], threshold: string): Agent[] {
  if (threshold === "all") return agents;
  const now = Date.now();
  const thresholdMs: Record<string, number> = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };
  const ms = thresholdMs[threshold];
  if (!ms) return agents;
  return agents.filter((a) => {
    if (!a.uptime_since) return false;
    return now - new Date(a.uptime_since).getTime() >= ms;
  });
}

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-lg border border-border p-6 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-surface-hover/50 rounded w-5 h-5" />
          <div>
            <div className="bg-surface-hover/50 rounded h-4 w-24 mb-1" />
            <div className="bg-surface-hover/50 rounded h-3 w-16" />
          </div>
        </div>
      </div>
      <div className="bg-surface-hover/50 rounded h-3 w-20 mb-2" />
      <div className="bg-surface-hover/50 rounded h-3 w-full mb-2" />
      <div className="bg-surface-hover/50 rounded h-3 w-12 mb-2" />
      <div className="flex items-center justify-between">
        <div className="bg-surface-hover/50 rounded h-3 w-16" />
        <div className="bg-surface-hover/50 rounded h-8 w-20" />
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-surface rounded-lg border border-border p-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-4 bg-surface-hover/50 rounded w-full mb-3" />
      ))}
    </div>
  );
}

export function AgentsPage() {
  const { agentFilters, resetAgentFilters } = useFilterStore();
  const { agentView } = useViewStore();
  const [uptimeThreshold, setUptimeThreshold] = useState("all");
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [dir, setDir] = useState<"asc" | "desc" | undefined>(undefined);
  const { data, isLoading, isError, refetch } = useAgents({
    ...agentFilters,
    sort,
    dir,
  });

  const agents = data?.data ?? [];
  const filteredAgents = filterByUptime(agents, uptimeThreshold);

  function handleClearFilters() {
    resetAgentFilters();
    setUptimeThreshold("all");
  }

  function handleSortChange(column: string) {
    if (sort === column) {
      if (dir === "asc") {
        setDir("desc");
      } else {
        setSort(undefined);
        setDir(undefined);
      }
    } else {
      setSort(column);
      setDir("asc");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Agent Fleet
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage, monitor, and configure all registered OpenClaw agents.
          </p>
        </div>
        <AgentViewToggle />
      </div>

      {/* Filters */}
      <div className="mt-6">
        <AgentFilters
          uptimeThreshold={uptimeThreshold}
          onUptimeChange={setUptimeThreshold}
        />
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading && (
          agentView === "table" ? (
            <SkeletonTable />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-danger opacity-50 mb-4"
              style={{ fontSize: 48 }}
            />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Failed to load agents
            </h2>
            <p className="text-sm text-text-secondary max-w-md text-center mb-6">
              Unable to fetch agent data from the server. Check that the Rails
              server is running and try again.
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredAgents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FontAwesomeIcon
              icon={faRobot}
              className="text-text-secondary opacity-50 mb-4"
              style={{ fontSize: 48 }}
            />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              No agents found
            </h2>
            <p className="text-sm text-text-secondary max-w-md text-center mb-6">
              No agents match the current filters. Try adjusting your filter
              criteria or check that agents are registered.
            </p>
            <Button variant="secondary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredAgents.length > 0 && (
          agentView === "table" ? (
            <AgentTable
              agents={filteredAgents}
              sort={sort}
              dir={dir}
              onSortChange={handleSortChange}
            />
          ) : (
            <AgentGrid agents={filteredAgents} />
          )
        )}
      </div>
    </div>
  );
}
