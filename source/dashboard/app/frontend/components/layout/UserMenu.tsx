import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGear,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { getCsrfToken } from "@/lib/csrf";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeMenu]);

  async function handleSignOut() {
    const token = getCsrfToken();
    await fetch("/users/sign_out", {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": token,
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    });
    window.location.href = "/users/sign_in";
  }

  function handleNavigate(path: string) {
    navigate(path);
    closeMenu();
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FontAwesomeIcon
          icon={faUser}
          className="w-4 h-4 text-text-secondary"
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg z-50",
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text-primary">
              Admin User
            </p>
            <p className="text-xs text-text-secondary">admin@openclaw.local</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleNavigate("/settings")}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/settings")}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Sign Out */}
          <div className="py-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
