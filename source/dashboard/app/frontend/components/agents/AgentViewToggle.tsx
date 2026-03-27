import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCellsLarge,
  faTableList,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui";
import { useViewStore } from "@/stores/viewStore";

export function AgentViewToggle() {
  const { agentView, setAgentView } = useViewStore();

  return (
    <div className="flex items-center gap-1 bg-surface rounded-md p-1 border border-border">
      <Button
        variant={agentView === "grid" ? "primary" : "ghost"}
        size="sm"
        aria-label="Grid view"
        aria-pressed={agentView === "grid"}
        onClick={() => setAgentView("grid")}
      >
        <FontAwesomeIcon icon={faTableCellsLarge} />
      </Button>
      <Button
        variant={agentView === "table" ? "primary" : "ghost"}
        size="sm"
        aria-label="Table view"
        aria-pressed={agentView === "table"}
        onClick={() => setAgentView("table")}
      >
        <FontAwesomeIcon icon={faTableList} />
      </Button>
    </div>
  );
}
