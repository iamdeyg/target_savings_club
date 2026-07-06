import { createFileRoute } from "@tanstack/react-router";
import { HandCoins, Wallet, TrendingUp, Coins } from "lucide-react";
import { PageHeader, SectionCard, StatCard } from "@/components/ui-blocks";
import { Avatar, StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import {
  fmtNaira,
  fmtNairaExact,
  getCurrentMonthRow,
  getOutstandingBalance,
  getInterestPaid,
  getPrincipalPaid,
} from "@/lib/loan-engine";
import { toast } from "sonner";
import { useMemo } from "react";

export const Route = createFileRoute("/admin/loans")({
  head: () => ({ meta: [{ title: "Active Loans — Admin Portal" }] }),
  component: ActiveLoansPage,
});

function ActiveLoansPage() {
  const { members, config, recordRepayment } = useStore();
  const rate = config.interestRate;
  const loanPortfolio = useMemo(() => {
    const withLoans = members.filter((m) => m.loan && !m.loan.pending);
    return {
      withLoans,
      totalDisbursed: withLoans.reduce(
        (t, m) => t + (m.loan?.original ?? 0),
        0,
      ),
      totalOutstanding: withLoans.reduce(
        (t, m) => t + (m.loan ? getOutstandingBalance(m.loan, rate) : 0),
        0,
      ),
      totalRepaid: withLoans.reduce(
        (t, m) => t + (m.loan ? getPrincipalPaid(m.loan, rate) : 0),
        0,
      ),
      totalInterestCharged: withLoans.reduce(
        (t, m) => t + (m.loan ? getInterestPaid(m.loan, rate) : 0),
        0,
      ),
    };
  }, [members, rate]);

  return (
    <>
      <PageHeader
        title="Active Loans"
        subtitle={`${loanPortfolio.withLoans.length} loans in the portfolio`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total disbursed"
          value={fmtNaira(loanPortfolio.totalDisbursed)}
          icon={<HandCoins className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Outstanding"
          value={fmtNaira(loanPortfolio.totalOutstanding)}
          icon={<Wallet className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="Refund repaid"
          value={fmtNaira(loanPortfolio.totalRepaid)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Interest earned"
          value={fmtNaira(loanPortfolio.totalInterestCharged)}
          icon={<Coins className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <div className="mt-6">
        <SectionCard title="Loan portfolio">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Member</th>
                  <th className="pb-3 text-left font-medium">Ref</th>
                  <th className="pb-3 text-right font-medium">Original</th>
                  <th className="pb-3 text-right font-medium">Outstanding</th>
                  <th className="pb-3 text-right font-medium">This month</th>
                  <th className="pb-3 text-left font-medium">Next due</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loanPortfolio.withLoans.map((m) => {
                  const l = m.loan!;
                  const outstanding = getOutstandingBalance(l, rate);
                  const currentRow = getCurrentMonthRow(l, rate);
                  const tone: "success" | "danger" | "muted" | "primary" =
                    l.status === "Repaid"
                      ? "muted"
                      : l.status === "Overdue"
                        ? "danger"
                        : "success";
                  return (
                    <tr key={m.id} className="hover:bg-muted/40">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={m.initials}
                            bg={m.color}
                            color={m.textColor}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold">{m.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {m.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-xs">{l.ref}</td>
                      <td className="py-3 text-right tabular-nums">
                        {fmtNaira(l.original)}
                      </td>
                      <td className="py-3 text-right font-semibold text-info tabular-nums">
                        {fmtNaira(outstanding)}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {currentRow ? (
                          <div>
                            <div className="font-semibold">
                              {fmtNairaExact(currentRow.totalDue)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Refund {fmtNairaExact(currentRow.principal)} + I{" "}
                              {fmtNairaExact(currentRow.interest)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {l.nextDueLabel}
                      </td>
                      <td className="py-3">
                        <StatusBadge tone={tone}>
                          {l.status ?? "Active"}
                        </StatusBadge>
                      </td>
                      <td className="py-3 text-right">
                        {l.status !== "Repaid" && (
                          <button
                            onClick={() => {
                              recordRepayment(m.id);
                              toast.success(`Repayment recorded for ${m.name}`);
                            }}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-strong"
                          >
                            Record payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
