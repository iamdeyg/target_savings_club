import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted"
  | "primary"
  | "accent";

const toneMap: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive-soft text-destructive",
  info: "bg-info-soft text-info",
  muted: "bg-muted text-muted-foreground",
  primary: "bg-primary-soft text-primary-strong",
  accent: "bg-accent-soft text-accent",
};

export function StatusBadge({
  tone = "muted",
  children,
  className,
  dot = true,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneMap[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "success" && "bg-success",
            tone === "warning" && "bg-warning",
            tone === "danger" && "bg-destructive",
            tone === "info" && "bg-info",
            tone === "muted" && "bg-muted-foreground/60",
            tone === "primary" && "bg-primary",
            tone === "accent" && "bg-accent",
          )}
        />
      )}
      {children}
    </span>
  );
}

export function Avatar({
  initials,
  bg,
  color,
  size = "md",
}: {
  initials: string;
  bg: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-10 w-10 text-sm";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sz,
      )}
      style={{ backgroundColor: bg, color }}
    >
      {initials}
    </div>
  );
}
