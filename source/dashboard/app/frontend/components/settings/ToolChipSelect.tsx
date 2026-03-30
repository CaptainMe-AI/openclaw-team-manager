import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ToolChipSelectProps {
  selected: string[];
  available: string[];
  onChange: (tools: string[]) => void;
}

export function ToolChipSelect({ selected, available, onChange }: ToolChipSelectProps) {
  const [selectValue, setSelectValue] = useState("");

  const unselected = available.filter((t) => !selected.includes(t));

  function handleAdd() {
    if (selectValue && !selected.includes(selectValue)) {
      onChange([...selected, selectValue]);
      setSelectValue("");
    }
  }

  function handleRemove(tool: string) {
    onChange(selected.filter((t) => t !== tool));
  }

  return (
    <div className="bg-background border border-border rounded-md p-4">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((tool) => (
            <span
              key={tool}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-hover border border-border text-text-primary"
            >
              {tool}
              <button
                type="button"
                onClick={() => handleRemove(tool)}
                className="ml-1 text-text-secondary hover:text-danger"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <select
          value={selectValue}
          onChange={(e) => setSelectValue(e.target.value)}
          className={cn(
            "flex-1 bg-surface border border-border rounded-md py-1.5 pl-3 pr-8 text-sm text-text-primary",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent",
          )}
        >
          <option value="" disabled>
            Select a tool to add...
          </option>
          {unselected.map((tool) => (
            <option key={tool} value={tool}>
              {tool}
            </option>
          ))}
        </select>
        <Button variant="secondary" size="sm" disabled={!selectValue} onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}
