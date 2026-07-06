import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet,
  HandCoins,
  Calendar,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  PiggyBank,
} from "lucide-react";
import { PageHeader, SectionCard, StatCard } from "@/components/ui-blocks";
import { StatusBadge } from "@/components/status-badge";
import { useStore, useCurrentMember } from "@/lib/store";
import {
  fmtNaira,
  fmtNairaExact,
  generateSchedule,
  getCurrentMonthRow,
  getLoanEligibilityMax,
  getOutstandingBalance,
  getTotalInterest,
  getTotalSavings,
} from "@/lib/loan-engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/member/")({
  head: () => ({ meta: [{ title: "My Dashboard — Member Portal" }] }),
  component: MemberDashboard,
});

function MemberDashboard() {
  const { config } = useStore();
  const currentMember = useCurrentMember();
  if (!currentMember) return null;
  const m = currentMember;
  const rate = config.interestRate;
  const totalSavings = getTotalSavings(m);
  const maxEligible = getLoanEligibilityMax(m, config);

  const hasLoan = m.loan && !m.loan.pending;
  const outstanding = hasLoan ? getOutstandingBalance(m.loan!, rate) : 0;
  const current = hasLoan ? getCurrentMonthRow(m.loan!, rate) : null;
  const schedule = hasLoan
    ? generateSchedule(m.loan!.original, m.loan!.months, rate)
    : [];
  const upcoming = hasLoan
    ? schedule.slice(m.loan!.monthsPaid, m.loan!.monthsPaid + 3)
    : [];
  const totalInterest = hasLoan ? getTotalInterest(m.loan!, rate) : 0;
  const progress = hasLoan
    ? Math.round((m.loan!.monthsPaid / m.loan!.months) * 100)
    : 0;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${m.name.split(" ")[0]}`}
        subtitle={`Member ${m.id} · Joined ${m.joined}`}
      />

      {/* Account standing banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-strong to-accent p-6 text-primary-foreground shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-black/10 blur-3xl" />
        <div className="relative grid gap-4 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <CheckCircle2 className="h-3.5 w-3.5" /> Account in good standing
            </div>
            <h2 className="mt-3 text-2xl font-bold">Next contribution due</h2>
            <div className="mt-1 text-sm text-white/85">
              ₦{config.monthlyContribution.toLocaleString()} on the{" "}
              {config.contributionDueDay}
              {ordinal(config.contributionDueDay)} of next month
            </div>
          </div>
          {current && (
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs uppercase tracking-wider text-white/80">
                Next loan payment
              </div>
              <div className="mt-1 text-2xl font-bold">
                {fmtNairaExact(current.totalDue)}
              </div>
              <div className="text-xs text-white/80">
                Refund {fmtNairaExact(current.principal)} · Interest{" "}
                {fmtNairaExact(current.interest)}
              </div>
              <div className="mt-1 text-xs font-semibold text-white/90">
                Due {m.loan!.nextDueLabel}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total savings"
          value={fmtNaira(totalSavings)}
          icon={<Wallet className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Loan outstanding"
          value={hasLoan ? fmtNaira(outstanding) : "—"}
          icon={<HandCoins className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="This month's payment"
          value={current ? fmtNairaExact(current.totalDue) : "—"}
          icon={<Calendar className="h-5 w-5" />}
          tone="warning"
        />
        <StatCard
          label="Max loan eligibility"
          value={fmtNaira(maxEligible)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="accent"
        />
      </div>

      {hasLoan && (
        <div className="mt-6">
          <SectionCard
            title="Loan repayment progress"
            desc={`${m.loan!.ref} · ${m.loan!.monthsPaid} of ${m.loan!.months} months · Total interest ${fmtNaira(totalInterest)}`}
          >
            <div className="mb-2 flex justify-between text-xs font-semibold">
              <span>{progress}% complete</span>
              <span className="text-muted-foreground">
                {m.loan!.months - m.loan!.monthsPaid} months remaining
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Link
              to="/member/loans"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-strong"
            >
              View full schedule <ArrowRight className="h-4 w-4" />
            </Link>
          </SectionCard>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {upcoming.length > 0 && (
          <SectionCard
            title="Upcoming 3 payments"
            desc="Calculated live from the engine"
          >
            <ul className="space-y-3">
              {upcoming.map((row, idx) => (
                <li
                  key={row.month}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-3",
                    idx === 0 && "border-primary/40 bg-primary-soft",
                  )}
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Month {row.month}
                    </div>
                    <div className="text-sm">
                      Refund {fmtNairaExact(row.principal)} + Interest{" "}
                      {fmtNairaExact(row.interest)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold tabular-nums">
                      {fmtNairaExact(row.totalDue)}
                    </div>
                    {idx === 0 && (
                      <StatusBadge tone="primary">Due now</StatusBadge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        <SectionCard title="Recent savings" desc="Your last 5 contributions">
          <ul className="space-y-2">
            {[...m.savingsHistory]
              .reverse()
              .slice(0, 5)
              .map((s) => (
                <li
                  key={s.mo}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <PiggyBank className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{s.mo}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">
                      {s.ok ? fmtNaira(s.paid) : "—"}
                    </div>
                    <StatusBadge tone={s.ok ? "success" : "danger"}>
                      {s.ok ? "Paid" : "Missed"}
                    </StatusBadge>
                  </div>
                </li>
              ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
