import { PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft",
        className,
      )}
    >
      <PiggyBank className="h-5 w-5" strokeWidth={2.2} />
    </div>
  );
}

export function BrandBlock({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <BrandLogo />
      <div className="leading-tight">
        <div className="text-[15px] font-bold tracking-tight">
          Target Savings and Loans Club
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
