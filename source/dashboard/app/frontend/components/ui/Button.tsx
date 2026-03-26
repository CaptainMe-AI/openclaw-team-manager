import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-background hover:bg-accent-hover",
  secondary: "bg-surface border border-border text-text-primary hover:bg-surface-hover",
  danger: "bg-transparent border border-danger text-danger hover:bg-danger/10",
  ghost: "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2 py-1 text-xs gap-1",
  md: "px-3 py-2 text-sm gap-2",
  lg: "px-4 py-2 text-sm gap-2",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  glow = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
        "active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        glow && variant === "primary" && "shadow-[0_0_10px_rgba(0,212,170,0.3)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
