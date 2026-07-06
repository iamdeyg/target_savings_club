import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { ScheduleTable } from "@/components/schedule-table";
import { useCurrentMember, useStore } from "@/lib/store";
import {
  fmtNaira,
  generateSchedule,
  getLoanEligibilityMax,
  getTotalSavings,
} from "@/lib/loan-engine";
import { AlertCircle, CheckCircle2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/member/apply")({
  head: () => ({ meta: [{ title: "Apply for Loan — Member Portal" }] }),
  component: ApplyPage,
});

function ApplyPage() {
  const m = useCurrentMember();
  const { config, submitLoanApplication } = useStore();
  const navigate = useNavigate();

  const maxEligible = m ? getLoanEligibilityMax(m, config) : 0;
  const totalSavings = m ? getTotalSavings(m) : 0;

  const [amount, setAmount] = useState(50000);
  const [months, setMonths] = useState(6);
  const [purpose, setPurpose] = useState("");

  const withinLimit = amount > 0 && amount <= maxEligible;
  const validMonths = months >= 1 && months <= config.maxRepaymentMonths;

  const schedule = useMemo(
    () =>
      amount > 0 && validMonths
        ? generateSchedule(amount, months, config.interestRate)
        : [],
    [amount, months, validMonths, config.interestRate],
  );
  const totalRepayable = schedule.reduce((t, r) => t + r.totalDue, 0);
  const totalInterest = totalRepayable - amount;

  if (!m) return null;

  return (
    <>
      <PageHeader
        title="Apply for a Loan"
        subtitle="Live calculator — figures update as you type"
      />

      <div
        className={cn(
          "mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm",
          withinLimit
            ? "border-success/40 bg-success-soft text-success"
            : "border-warning/40 bg-warning-soft text-warning",
        )}
      >
        {withinLimit ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        )}
        <div>
          <div className="font-bold">
            You can borrow up to {fmtNaira(maxEligible)}
          </div>
          <div className="opacity-90">
            Based on your total savings of {fmtNaira(totalSavings)} ×{" "}
            {config.maxLoanMultiplier} (cooperative multiplier).
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Loan calculator" className="lg:col-span-1">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Amount (₦)
            </span>
            <input
              type="number"
              min={0}
              max={maxEligible}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-lg font-bold tabular-nums outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="range"
              min={0}
              max={Math.max(maxEligible, 10000)}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              className="mt-2 w-full accent-[color:var(--primary)]"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Repayment months (max {config.maxRepaymentMonths})
            </span>
            <input
              type="number"
              min={1}
              max={config.maxRepaymentMonths}
              value={months}
              onChange={(e) => setMonths(+e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="range"
              min={1}
              max={config.maxRepaymentMonths}
              value={months}
              onChange={(e) => setMonths(+e.target.value)}
              className="mt-2 w-full accent-[color:var(--primary)]"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Purpose
            </span>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What will you use this loan for?"
              className="mt-1 h-24 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <div className="mt-6 space-y-2 rounded-xl border bg-muted/40 p-4 text-sm">
            <SummaryRow label="Refund" value={fmtNaira(amount)} />
            <SummaryRow
              label={`Interest (${config.interestRate}% declining)`}
              value={fmtNaira(Math.round(totalInterest))}
            />
            <SummaryRow
              label="Total repayable"
              value={fmtNaira(Math.round(totalRepayable))}
              strong
            />
            <SummaryRow
              label="First month payment"
              value={
                schedule[0] ? fmtNaira(Math.round(schedule[0].totalDue)) : "—"
              }
            />
            <SummaryRow
              label="Last month payment"
              value={
                schedule.at(-1)
                  ? fmtNaira(Math.round(schedule.at(-1)!.totalDue))
                  : "—"
              }
            />
          </div>

          <button
            disabled={
              !withinLimit || !validMonths || !purpose.trim() || !!m.loan
            }
            onClick={() => {
              submitLoanApplication(m.id, amount, months, purpose.trim());
              toast.success("Loan application submitted for admin review");
              navigate({ to: "/member/loans" });
            }}
            className="mt-6 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {m.loan
              ? "You have an existing loan/application"
              : "Submit application"}
          </button>
        </SectionCard>

        <SectionCard
          title="Repayment schedule preview"
          desc="Computed live from the engine — every row is what you'll actually pay."
          className="lg:col-span-2"
        >
          {schedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Calculator className="h-10 w-10" />
              <p className="mt-2 text-sm">
                Enter an amount and months to see the schedule.
              </p>
            </div>
          ) : (
            <ScheduleTable
              principal={amount}
              months={months}
              rate={config.interestRate}
              monthsPaid={0}
              startLabel="Application"
            />
          )}
        </SectionCard>
      </div>
    </>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          strong ? "text-base font-bold" : "font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}
