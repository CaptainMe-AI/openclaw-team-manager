import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faSliders,
  faRobot,
  faBell,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";

export type SettingsTab = "general" | "agents" | "notifications" | "datasources";

const tabs: { id: SettingsTab; label: string; icon: IconDefinition }[] = [
  { id: "general", label: "General", icon: faSliders },
  { id: "agents", label: "Agents", icon: faRobot },
  { id: "notifications", label: "Notifications", icon: faBell },
  { id: "datasources", label: "Data Sources", icon: faDatabase },
];

interface SettingsTabsProps {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

export function SettingsTabs({ active, onChange }: SettingsTabsProps) {
  return (
    <nav className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md w-full text-left whitespace-nowrap lg:whitespace-normal transition-colors",
            active === tab.id
              ? "bg-surface-hover text-accent"
              : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
          )}
        >
          <FontAwesomeIcon icon={tab.icon} className="w-4" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
