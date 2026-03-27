import { cn } from "@/lib/utils";

const PRIORITIES = [
  { level: 0, label: "Critical", colorClass: "bg-priority-0" },
  { level: 1, label: "High", colorClass: "bg-priority-1" },
  { level: 2, label: "Medium", colorClass: "bg-priority-2" },
  { level: 3, label: "Low", colorClass: "bg-priority-3" },
] as const;

export function PriorityLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {PRIORITIES.map(({ level, label, colorClass }) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className={cn("inline-block w-2.5 h-2.5 rounded-full", colorClass)}
          />
          <span className="text-xs text-text-secondary">{label}</span>
        </div>
      ))}
    </div>
  );
}
