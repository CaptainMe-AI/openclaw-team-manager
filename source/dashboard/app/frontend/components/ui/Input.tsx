import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, icon, className, ...props }, ref) => {
    const inputId = React.useId();
    const id = props.id ?? inputId;

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-text-primary mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-background border border-border rounded-md py-2 px-3 text-sm text-text-primary placeholder-text-secondary",
              "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors",
              error &&
                "border-danger focus:border-danger focus:ring-danger",
              icon && "pl-9",
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            {...props}
          />
        </div>
        {error ? (
          <p id={`${id}-error`} className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${id}-helper`} className="mt-1 text-xs text-text-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
