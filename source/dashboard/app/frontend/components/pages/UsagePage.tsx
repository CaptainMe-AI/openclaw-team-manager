import { PlaceholderSkeleton } from "@/components/ui/PlaceholderSkeleton";

export function UsagePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-primary">Usage &amp; Cost Tracking</h1>
      <p className="text-sm text-text-secondary mt-1">Monitor API consumption, latency, and estimated costs across your agent fleet.</p>
      <PlaceholderSkeleton className="mt-6" />
    </div>
  );
}
