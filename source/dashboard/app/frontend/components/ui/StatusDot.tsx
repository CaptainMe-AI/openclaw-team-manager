import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "bg-success",
  success: "bg-success",
  idle: "bg-text-secondary",
  error: "bg-danger",
  danger: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
  offline: "bg-border",
};

const sizeClasses: Record<string, string> = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
};

type Status =
  | "active"
  | "success"
  | "idle"
  | "error"
  | "danger"
  | "warning"
  | "info"
  | "offline";

type Size = "sm" | "md";

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: Status;
  size?: Size;
  pulse?: boolean;
}

export function StatusDot({
  status = "active",
  size = "sm",
  pulse = false,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span
      role="status"
      aria-label={status}
      className={cn(
        "inline-block rounded-full",
        statusColors[status],
        sizeClasses[size],
        pulse && "animate-pulse",
        className,
      )}
      {...props}
    />
  );
}
