import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import {
  Wallet,
  CheckCircle2,
  Clock,
  TrendingUp,
  Receipt,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard, StatCard } from "@/components/ui-blocks";
import { Avatar, StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { fmtNaira } from "@/lib/loan-engine";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/savings")({
  head: () => ({ meta: [{ title: "Savings Records — Admin Portal" }] }),
  component: SavingsPage,
});

function SavingsPage() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  if (pathname.startsWith("/admin/savings/manual")) {
    return <Outlet />;
  }

  return <SavingsRecordsPage />;
}

function SavingsRecordsPage() {
  const { members, config, recordSaving } = useStore();
  const months = members[0]?.savingsHistory.map((s) => s.mo) ?? [];
  const [month, setMonth] = useState(months[months.length - 1] ?? "");

  const rows = useMemo(
    () =>
      members.map((m) => {
        const entry = m.savingsHistory.find((s) => s.mo === month);
        return { m, entry };
      }),
    [members, month],
  );

  const expected = members.length * config.monthlyContribution;
  const paidCount = rows.filter((r) => r.entry?.ok).length;
  const pendingCount = members.length - paidCount;
  const collected = rows.reduce(
    (t, r) => t + (r.entry?.ok ? r.entry.paid : 0),
    0,
  );
  const rate = expected ? Math.round((collected / expected) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Savings Records"
        subtitle="Monthly contribution collection"
        actions={
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border bg-card px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
          >
            {[...months].reverse().map((mo) => (
              <option key={mo}>{mo}</option>
            ))}
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={fmtNaira(expected)}
          icon={<Wallet className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Members paid"
          value={paidCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Members pending"
          value={pendingCount}
          icon={<Clock className="h-5 w-5" />}
          tone="warning"
        />
        <StatCard
          label="Collection rate"
          value={`${rate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="info"
        />
      </div>

      <div className="mt-6">
        <SectionCard
          title={`Contributions for ${month}`}
          action={
            <Link
              to="/admin/savings/manual"
              search={{ month }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
            >
              <Plus className="h-4 w-4" /> Manual Record
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Member</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                  <th className="pb-3 text-left font-medium">Date</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(({ m, entry }) => (
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
                    <td className="py-3 text-right font-semibold tabular-nums">
                      {entry?.ok ? fmtNaira(entry.paid) : "—"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {entry?.ok ? entry.date : "—"}
                    </td>
                    <td className="py-3">
                      <StatusBadge tone={entry?.ok ? "success" : "warning"}>
                        {entry?.ok ? "Paid" : "Pending"}
                      </StatusBadge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {!entry?.ok && (
                          <button
                            onClick={() => {
                              recordSaving(
                                m.id,
                                month,
                                config.monthlyContribution,
                              );
                              toast.success(
                                `Recorded ₦${config.monthlyContribution.toLocaleString()} for ${m.name}`,
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-strong"
                          >
                            <Plus className="h-3.5 w-3.5" /> Record
                          </button>
                        )}
                        {entry?.ok && (
                          <button className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                            <Receipt className="h-3.5 w-3.5" /> Receipt
                          </button>
                        )}
                      </div>
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
