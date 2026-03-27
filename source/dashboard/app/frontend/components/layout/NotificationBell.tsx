import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

export function NotificationBell() {
  return (
    <button
      type="button"
      className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
      aria-label="Notifications"
    >
      <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
      {/* Unread dot indicator */}
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
    </button>
  );
}
