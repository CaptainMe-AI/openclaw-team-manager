import { Button } from "@/components/ui";
import { useFilterStore } from "@/stores/filterStore";

const options = ["1h", "6h", "24h", "7d", "30d"] as const;

export function UsageTimePeriod() {
  const { usageTimeRange, setUsageTimeRange } = useFilterStore();

  return (
    <div className="flex items-center gap-2">
      {options.map((opt) => (
        <Button
          key={opt}
          variant={usageTimeRange === opt ? "primary" : "secondary"}
          size="sm"
          aria-pressed={usageTimeRange === opt}
          onClick={() => setUsageTimeRange(opt)}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}
