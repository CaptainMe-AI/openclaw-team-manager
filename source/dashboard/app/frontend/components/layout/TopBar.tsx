import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useUIStore } from "@/stores/uiStore";
import { Breadcrumb } from "./Breadcrumb";
import { SearchInput } from "./SearchInput";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

export function TopBar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header className="h-16 bg-surface border-b border-border px-4 lg:px-6 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger - hidden on desktop */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle navigation"
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
        </button>
        <Breadcrumb />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <SearchInput />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
