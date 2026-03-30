import type React from "react";

interface SettingsFormRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

export function SettingsFormRow({ label, description, children }: SettingsFormRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
      <div className="md:col-span-1">
        <span className="block text-sm font-medium text-text-primary mb-1">{label}</span>
        <span className="text-xs text-text-secondary">{description}</span>
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}
