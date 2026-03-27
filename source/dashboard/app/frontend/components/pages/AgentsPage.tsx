import { PlaceholderSkeleton } from "@/components/ui/PlaceholderSkeleton";

export function AgentsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-primary">Agent Fleet</h1>
      <p className="text-sm text-text-secondary mt-1">Manage, monitor, and configure all registered OpenClaw agents.</p>
      <PlaceholderSkeleton className="mt-6" />
    </div>
  );
}
