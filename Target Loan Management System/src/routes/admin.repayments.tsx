import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { Avatar } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { fmtNairaExact } from "@/lib/loan-engine";
import { Receipt } from "lucide-react";

export const Route = createFileRoute("/admin/repayments")({
  head: () => ({ meta: [{ title: "Repayments — Admin Portal" }] }),
  component: RepaymentsPage,
});

function RepaymentsPage() {
  const { repayments, members } = useStore();

  return (
    <>
      <PageHeader
        title="Repayments Ledger"
        subtitle="All recorded loan repayments"
      />

      <SectionCard>
        {repayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No repayments recorded yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Record payments from the Active Loans page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Date</th>
                  <th className="pb-3 text-left font-medium">Member</th>
                  <th className="pb-3 text-left font-medium">Loan</th>
                  <th className="pb-3 text-right font-medium">Month</th>
                  <th className="pb-3 text-right font-medium">Refund</th>
                  <th className="pb-3 text-right font-medium">Interest</th>
                  <th className="pb-3 text-right font-medium">Total paid</th>
                  <th className="pb-3 text-right font-medium">New balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {repayments.map((r) => {
                  const m = members.find((x) => x.id === r.memberId);
                  return (
                    <tr key={r.id} className="hover:bg-muted/40">
                      <td className="py-3 text-muted-foreground">{r.date}</td>
                      <td className="py-3">
                        {m && (
                          <div className="flex items-center gap-2">
                            <Avatar
                              initials={m.initials}
                              bg={m.color}
                              color={m.textColor}
                              size="sm"
                            />
                            <span className="font-semibold">{m.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-mono text-xs">{r.loanRef}</td>
                      <td className="py-3 text-right">{r.month}</td>
                      <td className="py-3 text-right tabular-nums">
                        {fmtNairaExact(r.principal)}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {fmtNairaExact(r.interest)}
                      </td>
                      <td className="py-3 text-right font-semibold tabular-nums">
                        {fmtNairaExact(r.total)}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {fmtNairaExact(r.newBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
