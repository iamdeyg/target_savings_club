import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatCard } from "@/components/ui-blocks";
import { StatusBadge } from "@/components/status-badge";
import { useCurrentMember } from "@/lib/store";
import { fmtNaira, getTotalSavings } from "@/lib/loan-engine";
import { PiggyBank, Calendar, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/member/savings")({
  head: () => ({ meta: [{ title: "My Savings — Member Portal" }] }),
  component: MySavingsPage,
});

function MySavingsPage() {
  const m = useCurrentMember();
  if (!m) return null;

  const totalSaved = getTotalSavings(m);
  const monthsActive = m.savingsHistory.length;
  const paid = m.savingsHistory.filter((s) => s.ok).length;
  const missed = monthsActive - paid;

  return (
    <>
      <PageHeader title="My Savings" subtitle="Complete contribution history" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total saved"
          value={fmtNaira(totalSaved)}
          icon={<PiggyBank className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Months active"
          value={monthsActive}
          icon={<Calendar className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="Months paid"
          value={paid}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Missed"
          value={missed}
          icon={<XCircle className="h-5 w-5" />}
          tone={missed ? "danger" : "muted"}
        />
      </div>

      <div className="mt-6">
        <SectionCard title="Contribution history">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Month</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                  <th className="pb-3 text-left font-medium">Date paid</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...m.savingsHistory].reverse().map((s) => (
                  <tr key={s.mo} className="hover:bg-muted/40">
                    <td className="py-3 font-semibold">{s.mo}</td>
                    <td className="py-3 text-right tabular-nums">
                      {s.ok ? fmtNaira(s.paid) : "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">{s.date}</td>
                    <td className="py-3">
                      <StatusBadge tone={s.ok ? "success" : "danger"}>
                        {s.ok ? "Paid" : "Missed"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
