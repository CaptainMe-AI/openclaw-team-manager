import { cn } from "@/lib/utils";
import { StatusDot } from "./StatusDot";

type BadgeColor = "success" | "danger" | "warning" | "info" | "idle";
type PriorityLevel = "p0" | "p1" | "p2" | "p3";

const statusColorClasses: Record<BadgeColor, string> = {
  success: "bg-success/10 text-success border-success/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
  idle: "bg-text-secondary/10 text-text-secondary border-text-secondary/20",
};

const priorityColorClasses: Record<PriorityLevel, string> = {
  p0: "bg-priority-0/10 text-priority-0 border-priority-0/20",
  p1: "bg-priority-1/10 text-priority-1 border-priority-1/20",
  p2: "bg-priority-2/10 text-priority-2 border-priority-2/20",
  p3: "bg-priority-3/10 text-priority-3 border-priority-3/20",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "status" | "priority";
  color?: BadgeColor;
  priority?: PriorityLevel;
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export function Badge({
  variant = "status",
  color = "success",
  priority = "p2",
  dot = false,
  pulse = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const colorClasses =
    variant === "priority"
      ? priorityColorClasses[priority]
      : statusColorClasses[color];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-normal border",
        colorClasses,
        className,
      )}
      {...props}
    >
      {dot && variant === "status" && (
        <StatusDot status={color === "idle" ? "idle" : color} size="sm" pulse={pulse} />
      )}
      {children}
    </span>
  );
}
