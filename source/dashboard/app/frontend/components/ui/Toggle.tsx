import React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  const id = React.useId();

  return (
    <div className="inline-flex items-center gap-2">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
          checked ? "bg-accent" : "bg-border",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
      {label && (
        <label htmlFor={id} className="text-sm text-text-primary cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}
