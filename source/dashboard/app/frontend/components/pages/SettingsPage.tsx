import { PlaceholderSkeleton } from "@/components/ui/PlaceholderSkeleton";

export function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-primary">Configuration Settings</h1>
      <p className="text-sm text-text-secondary mt-1">Manage global preferences, agent policies, and data integrations.</p>
      <PlaceholderSkeleton className="mt-6" />
    </div>
  );
}
