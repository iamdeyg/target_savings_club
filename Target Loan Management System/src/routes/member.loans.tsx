import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatCard } from "@/components/ui-blocks";
import { StatusBadge } from "@/components/status-badge";
import { ScheduleTable } from "@/components/schedule-table";
import { useCurrentMember, useStore } from "@/lib/store";
import {
  fmtNaira,
  fmtNairaExact,
  getCurrentMonthRow,
  getOutstandingBalance,
  getTotalInterest,
} from "@/lib/loan-engine";
import {
  Wallet,
  Calendar,
  Coins,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/member/loans")({
  head: () => ({ meta: [{ title: "My Loans — Member Portal" }] }),
  component: MyLoansPage,
});

function MyLoansPage() {
  const m = useCurrentMember();
  const { config } = useStore();
  if (!m) return null;
  const rate = config.interestRate;
  const l = m.loan;

  if (!l) {
    return (
      <>
        <PageHeader title="My Loans" subtitle="Your loan activity" />
        <SectionCard>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-14 w-14 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-semibold">No active loan</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              You currently have no loans. You can apply for one using the loan
              calculator.
            </p>
            <Link
              to="/member/apply"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
            >
              Apply for a loan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionCard>
      </>
    );
  }

  if (l.pending) {
    return (
      <>
        <PageHeader
          title={`Loan Application · ${l.ref}`}
          subtitle="Awaiting admin review"
        />
        <SectionCard>
          <div className="mb-6 flex items-center gap-3">
            <StatusBadge tone="warning">Pending</StatusBadge>
            <span className="text-sm text-muted-foreground">
              Submitted for {fmtNaira(l.original)} over {l.months} months
            </span>
          </div>
          <ScheduleTable
            principal={l.original}
            months={l.months}
            rate={rate}
            monthsPaid={0}
            startLabel={l.startLabel}
          />
        </SectionCard>
      </>
    );
  }

  const outstanding = getOutstandingBalance(l, rate);
  const current = getCurrentMonthRow(l, rate);
  const totalInterest = getTotalInterest(l, rate);
  const monthsRemaining = l.months - l.monthsPaid;
  const progress = Math.round((l.monthsPaid / l.months) * 100);

  return (
    <>
      <PageHeader
        title={`Loan ${l.ref}`}
        subtitle={`${fmtNaira(l.original)} disbursed ${l.startLabel} · ${l.months} months at ${rate}% declining`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding balance"
          value={fmtNaira(outstanding)}
          icon={<Wallet className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="This month's payment"
          value={current ? fmtNairaExact(current.totalDue) : "Complete"}
          icon={<Calendar className="h-5 w-5" />}
          tone="warning"
        />
        <StatCard
          label="Total interest"
          value={fmtNaira(totalInterest)}
          icon={<Coins className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Months remaining"
          value={monthsRemaining}
          icon={<Clock className="h-5 w-5" />}
          tone="primary"
        />
      </div>

      <div className="mt-6">
        <SectionCard
          title="Repayment progress"
          desc={`${l.monthsPaid} of ${l.months} months paid`}
        >
          <div className="mb-2 flex justify-between text-xs font-semibold">
            <span>{progress}% complete</span>
            <span className="text-muted-foreground">
              {fmtNaira(l.original - outstanding)} of {fmtNaira(l.original)}{" "}
              refund
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Full amortization schedule"
          desc="From the loan engine · single source of truth"
        >
          <ScheduleTable
            principal={l.original}
            months={l.months}
            rate={rate}
            monthsPaid={l.monthsPaid}
            overdue={l.overdue}
            startLabel={l.startLabel}
          />
        </SectionCard>
      </div>
    </>
  );
}
