import { PlaceholderSkeleton } from "@/components/ui/PlaceholderSkeleton";

export function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-primary">Overview</h1>
      <p className="text-sm text-text-secondary mt-1">Real-time status of your OpenClaw agent fleet.</p>
      <PlaceholderSkeleton className="mt-6" />
    </div>
  );
}
