import { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key !== "/") return;

      const target = e.target as HTMLElement;
      const tagName = target.tagName;

      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      e.preventDefault();
      inputRef.current?.focus();
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  return (
    <div className="relative hidden sm:block">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="w-3.5 h-3.5"
          aria-hidden="true"
        />
      </span>
      <input
        ref={inputRef}
        type="text"
        className="w-48 lg:w-64 bg-background border border-border rounded-md py-2 pl-9 pr-3 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        placeholder="Search agents, tasks, or approvals (Press '/')"
        aria-label="Search"
      />
    </div>
  );
}
