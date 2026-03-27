import { useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/agents": "Agents",
  "/tasks": "Tasks",
  "/usage": "Usage",
  "/approvals": "Approvals",
  "/settings": "Settings",
};

export function Breadcrumb() {
  const { pathname } = useLocation();
  const pageName = routeNames[pathname] ?? "Unknown";

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <span className="text-text-secondary">Command Center</span>
      <FontAwesomeIcon
        icon={faChevronRight}
        className="w-2.5 h-2.5 text-text-secondary"
        aria-hidden="true"
      />
      <span className="text-text-primary font-semibold">{pageName}</span>
    </nav>
  );
}
