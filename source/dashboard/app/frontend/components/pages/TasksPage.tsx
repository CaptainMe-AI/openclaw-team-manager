import { PlaceholderSkeleton } from "@/components/ui/PlaceholderSkeleton";

export function TasksPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-primary">Task Board</h1>
      <p className="text-sm text-text-secondary mt-1">Monitor and manage agent workflows across all stages.</p>
      <PlaceholderSkeleton className="mt-6" />
    </div>
  );
}
