import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrip, faList } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui";
import { useViewStore } from "@/stores/viewStore";

export function TaskViewToggle() {
  const { taskView, setTaskView } = useViewStore();

  return (
    <div className="flex items-center gap-1 bg-surface rounded-md p-1 border border-border">
      <Button
        variant={taskView === "board" ? "primary" : "ghost"}
        size="sm"
        aria-label="Board view"
        aria-pressed={taskView === "board"}
        onClick={() => setTaskView("board")}
      >
        <FontAwesomeIcon icon={faGrip} />
      </Button>
      <Button
        variant={taskView === "list" ? "primary" : "ghost"}
        size="sm"
        aria-label="List view"
        aria-pressed={taskView === "list"}
        onClick={() => setTaskView("list")}
      >
        <FontAwesomeIcon icon={faList} />
      </Button>
    </div>
  );
}
