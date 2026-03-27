import { useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faRobot,
  faListCheck,
  faChartPie,
  faShieldHalved,
  faGear,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Badge } from "@/components/ui";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: IconDefinition;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: faChartLine },
  { label: "Agents", path: "/agents", icon: faRobot },
  { label: "Tasks", path: "/tasks", icon: faListCheck },
  { label: "Usage", path: "/usage", icon: faChartPie },
  { label: "Approvals", path: "/approvals", icon: faShieldHalved, badge: 3 },
  { label: "Settings", path: "/settings", icon: faGear },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-2 py-4">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors",
              isActive
                ? "bg-surface-hover text-accent border-l-2 border-accent"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
            )
          }
        >
          <FontAwesomeIcon
            icon={item.icon}
            className="w-4 h-4"
            aria-hidden="true"
          />
          <span>{item.label}</span>
          {item.badge !== undefined && (
            <Badge color="info" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Logo() {
  return (
    <div className="px-4 py-4 flex items-center gap-2">
      <FontAwesomeIcon
        icon={faRobot}
        className="w-4 h-4 text-accent"
        aria-hidden="true"
      />
      <span className="text-sm font-semibold text-text-primary">OpenClaw</span>
    </div>
  );
}

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const { pathname } = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface border-r border-border">
        <Logo />
        <NavItems />
      </aside>

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200",
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-50 lg:hidden transform transition-transform duration-200 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Logo />
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close navigation"
        >
          <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
        </button>
        <NavItems onNavigate={closeSidebar} />
      </aside>
    </>
  );
}
