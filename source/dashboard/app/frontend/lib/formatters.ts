// Format large numbers compactly: 42800000 -> "42.8M"
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// Format cents to dollars: 84250 -> "$842.50"
export function formatCost(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// Format latency: 1800 -> "1.8s", 245 -> "245ms"
export function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}

// Format trend percentage: 12.5 -> "12.5%"
export function formatTrend(value: number | null): string | null {
  if (value === null || value === undefined) return null;
  return `${Math.abs(value).toFixed(1)}%`;
}
