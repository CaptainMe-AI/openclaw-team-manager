import { PlaceholderSkeleton } from "@/components/ui/PlaceholderSkeleton";

export function ApprovalsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-primary">Approvals</h1>
      <p className="text-sm text-text-secondary mt-1">Manage pending requests and review historical decisions.</p>
      <PlaceholderSkeleton className="mt-6" />
    </div>
  );
}
