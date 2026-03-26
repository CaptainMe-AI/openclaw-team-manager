import { cn } from "@/lib/utils";

type Variant = "default" | "glow";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  padding = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-lg border border-border",
        variant === "default" && "hover:border-text-secondary transition-colors",
        variant === "glow" && "card-glow overflow-hidden",
        padding && "p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
