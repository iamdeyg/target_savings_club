import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, FileText } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { Avatar, StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { fmtNaira, isEligibleForLoan } from "@/lib/loan-engine";

export const Route = createFileRoute("/admin/applications")({
  head: () => ({ meta: [{ title: "Loan Applications — Admin Portal" }] }),
  component: LoanApplicationsPage,
});

function LoanApplicationsPage() {
  const { members, config } = useStore();
  const pending = members.filter((m) => m.loan?.pending);

  return (
    <>
      <PageHeader
        title="Loan Applications"
        subtitle={`${pending.length} pending review`}
      />

      <SectionCard>
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No pending applications
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Applicant</th>
                  <th className="pb-3 text-left font-medium">Ref</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                  <th className="pb-3 text-right font-medium">Months</th>
                  <th className="pb-3 text-left font-medium">Purpose</th>
                  <th className="pb-3 text-left font-medium">Eligibility</th>
                  <th className="pb-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pending.map((m) => {
                  const { eligible } = isEligibleForLoan(m, config);
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
                      <td className="py-3 font-mono text-xs">{m.loan!.ref}</td>
                      <td className="py-3 text-right font-semibold tabular-nums">
                        {fmtNaira(m.loan!.original)}
                      </td>
                      <td className="py-3 text-right">{m.loan!.months}</td>
                      <td className="py-3 max-w-[220px] truncate text-muted-foreground">
                        {m.loan!.purpose ?? "—"}
                      </td>
                      <td className="py-3">
                        <StatusBadge tone={eligible ? "success" : "danger"}>
                          {eligible ? "Eligible" : "Ineligible"}
                        </StatusBadge>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to="/admin/applications/$id"
                          params={{ id: m.id }}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-strong"
                        >
                          <Eye className="h-3.5 w-3.5" /> Review
                        </Link>
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
