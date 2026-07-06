import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Edit,
  Ban,
  CheckCircle2,
  Wallet,
  HandCoins,
  Calendar,
} from "lucide-react";
import { PageHeader, SectionCard, StatCard } from "@/components/ui-blocks";
import { Avatar, StatusBadge } from "@/components/status-badge";
import { ScheduleTable } from "@/components/schedule-table";
import { useStore } from "@/lib/store";
import {
  fmtNaira,
  fmtNairaExact,
  generateSchedule,
  getCurrentMonthPayment,
  getOutstandingBalance,
  getTotalSavings,
} from "@/lib/loan-engine";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/members/$id")({
  head: () => ({ meta: [{ title: "Member Detail — Admin Portal" }] }),
  component: MemberDetail,
  notFoundComponent: () => (
    <div className="p-8 text-center text-muted-foreground">
      Member not found.
    </div>
  ),
});

function MemberDetail() {
  const { id } = Route.useParams();
  const { members, config, suspendMember, reactivateMember } = useStore();

  const m = members.find((x) => x.id === id);
  if (!m) throw notFound();

  const totalSavings = getTotalSavings(m);
  const outstanding =
    m.loan && !m.loan.pending
      ? getOutstandingBalance(m.loan, config.interestRate)
      : 0;
  const currentPayment =
    m.loan && !m.loan.pending
      ? getCurrentMonthPayment(m.loan, config.interestRate)
      : 0;
  const schedule = m.loan
    ? generateSchedule(m.loan.original, m.loan.months, config.interestRate)
    : [];
  const upcoming = m.loan
    ? schedule.slice(m.loan.monthsPaid, m.loan.monthsPaid + 2)
    : [];

  return (
    <>
      <div className="pb-4">
        <Link
          to="/admin/members"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to members
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <Avatar
            initials={m.initials}
            bg={m.color}
            color={m.textColor}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{m.name}</h1>
              <StatusBadge
                tone={
                  m.status === "Active"
                    ? "success"
                    : m.status === "Overdue"
                      ? "danger"
                      : "muted"
                }
              >
                {m.status}
              </StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground">
              {m.id} · {m.job} at {m.employer} · Joined {m.joined}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">
            <Edit className="h-4 w-4" /> Edit
          </button>
          {m.status === "Suspended" ? (
            <button
              onClick={() => {
                reactivateMember(m.id);
                toast.success("Member reactivated");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <CheckCircle2 className="h-4 w-4" /> Reactivate
            </button>
          ) : (
            <button
              onClick={() => {
                suspendMember(m.id);
                toast.success("Member suspended");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90"
            >
              <Ban className="h-4 w-4" /> Suspend
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Savings"
          value={fmtNaira(totalSavings)}
          hint={`${m.savingsHistory.filter((s) => s.ok).length} of ${m.savingsHistory.length} months paid`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Loan Outstanding"
          value={fmtNaira(outstanding)}
          hint={
            m.loan?.pending
              ? "Pending approval"
              : m.loan
                ? m.loan.ref
                : "No active loan"
          }
          icon={<HandCoins className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="This Month's Payment"
          value={fmtNaira(currentPayment)}
          hint={m.loan?.nextDueLabel ?? "—"}
          icon={<Calendar className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Progress"
          value={
            m.loan
              ? `${Math.round((m.loan.monthsPaid / m.loan.months) * 100)}%`
              : "—"
          }
          hint={
            m.loan
              ? `${m.loan.monthsPaid} of ${m.loan.months} months`
              : "No loan"
          }
          tone="primary"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Personal information" className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm md:grid-cols-2">
            {[
              ["Phone", m.phone],
              ["Email", m.email],
              ["Address", m.address],
              ["Employer", m.employer],
              ["Job title", m.job],
              ["Bank", `${m.bank} · ${m.acct}`],
              ["Next of kin", m.kin],
              ["NOK phone", m.kinPhone],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {k}
                </dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Upcoming payments" desc="Next 2 due from engine">
          {m.loan && !m.loan.pending && upcoming.length > 0 ? (
            <ul className="space-y-3">
              {upcoming.map((r) => (
                <li
                  key={r.month}
                  className="rounded-xl border bg-info-soft/50 p-3"
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-info">
                    <span>Month {r.month}</span>
                    <span>Due</span>
                  </div>
                  <div className="mt-1 text-lg font-bold">
                    {fmtNairaExact(r.totalDue)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Refund {fmtNairaExact(r.principal)} + Interest{" "}
                    {fmtNairaExact(r.interest)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No active loan.</p>
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Savings history">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Month</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                  <th className="pb-3 text-left font-medium">Date</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...m.savingsHistory]
                  .reverse()
                  .slice(0, 12)
                  .map((s, i) => (
                    <tr key={i}>
                      <td className="py-2.5 font-medium">{s.mo}</td>
                      <td className="py-2.5 text-right tabular-nums">
                        {s.ok ? fmtNaira(s.paid) : "—"}
                      </td>
                      <td className="py-2.5 text-muted-foreground">{s.date}</td>
                      <td className="py-2.5">
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

      {m.loan && (
        <div className="mt-6">
          <SectionCard
            title={`Loan repayment schedule · ${m.loan.ref}`}
            desc={`${fmtNaira(m.loan.original)} over ${m.loan.months} months at ${config.interestRate}% monthly declining balance`}
          >
            <ScheduleTable
              principal={m.loan.original}
              months={m.loan.months}
              rate={config.interestRate}
              monthsPaid={m.loan.monthsPaid}
              overdue={m.loan.overdue}
              startLabel={m.loan.startLabel}
            />
          </SectionCard>
        </div>
      )}
    </>
  );
}
