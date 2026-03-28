const TIME_PERIOD_OPTIONS = [
  { label: "Last 1 Hour", value: "1h" },
  { label: "Last 6 Hours", value: "6h" },
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
];

interface DashboardTimePeriodProps {
  value: string;
  onChange: (value: string) => void;
}

export function DashboardTimePeriod({
  value,
  onChange,
}: DashboardTimePeriodProps) {
  return (
    <select
      className="bg-background border border-border rounded-md py-2 px-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent w-44"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      aria-label="Time period"
    >
      {TIME_PERIOD_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
