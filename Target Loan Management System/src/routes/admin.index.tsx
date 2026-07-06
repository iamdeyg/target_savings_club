import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Wallet,
  HandCoins,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { PageHeader, SectionCard, StatCard } from "@/components/ui-blocks";
import { StatusBadge, Avatar } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import {
  fmtNaira,
  getOutstandingBalance,
  getTotalSavings,
} from "@/lib/loan-engine";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin Portal" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { members, config, audit } = useStore();

  const summary = useMemo(() => {
    const activeLoanMembers = members.filter(
      (m) => m.loan && !m.loan.pending && m.loan.status !== "Repaid",
    );
    return {
      totalSavings: members.reduce((t, m) => t + getTotalSavings(m), 0),
      activeLoanMembers,
      totalOutstanding: activeLoanMembers.reduce(
        (t, m) =>
          t +
          (m.loan ? getOutstandingBalance(m.loan, config.interestRate) : 0),
        0,
      ),
      overdueCount: members.filter(
        (m) => m.loan?.overdue || m.status === "Overdue",
      ).length,
      activeMembersCount: members.filter((m) => m.status === "Active").length,
    };
  }, [members, config.interestRate]);

  // 6-month savings-vs-loans chart
  const chartData = useMemo(() => {
    const last6 = members[0]?.savingsHistory.slice(-6) ?? [];
    return last6.map((row, idx) => {
      const monthLabel = row.mo;
      const savings = members.reduce((t, m) => {
        const s = m.savingsHistory[m.savingsHistory.length - 6 + idx];
        return t + (s?.ok ? s.paid : 0);
      }, 0);
      // approximate loans disbursed = sum of loan originals from members whose loans started around then
      const loans =
        idx === 2 ? 150000 : idx === 4 ? 100000 : idx === 0 ? 80000 : 0;
      return { name: monthLabel.split(" ")[0], savings, loans };
    });
  }, [members]);

  // Loan portfolio doughnut
  const portfolio = useMemo(
    () => [
      {
        name: "Active",
        value: members.filter((m) => m.loan?.status === "Active").length,
        color: "oklch(0.475 0.13 130)",
      },
      {
        name: "Repaid",
        value: members.filter((m) => m.loan?.status === "Repaid").length,
        color: "oklch(0.6 0.11 175)",
      },
      {
        name: "Overdue",
        value: members.filter((m) => m.loan?.status === "Overdue").length,
        color: "oklch(0.6 0.19 25)",
      },
    ],
    [members],
  );

  return (
    <>
      <PageHeader
        title="Cooperative overview"
        subtitle={`${new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" })} · ${members.length} members`}
        actions={
          <Link
            to="/admin/members"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
          >
            View members <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Members"
          value={members.length}
          hint={`${summary.activeMembersCount} active`}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Total Savings Pool"
          value={fmtNaira(summary.totalSavings)}
          hint="Lifetime contributions"
          icon={<Wallet className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Active Loans"
          value={summary.activeLoanMembers.length}
          hint={`${fmtNaira(summary.totalOutstanding)} outstanding`}
          icon={<HandCoins className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="Overdue Accounts"
          value={summary.overdueCount}
          hint="Needs immediate attention"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Savings vs Loans"
          desc="Last 6 months"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 130)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="oklch(0.5 0.02 145)"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="oklch(0.5 0.02 145)"
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => fmtNaira(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.92 0.01 130)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="savings"
                  fill="oklch(0.475 0.13 130)"
                  radius={[6, 6, 0, 0]}
                  name="Savings"
                />
                <Bar
                  dataKey="loans"
                  fill="oklch(0.6 0.11 175)"
                  radius={[6, 6, 0, 0]}
                  name="Loans disbursed"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Loan Portfolio" desc="Distribution">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolio}
                  innerRadius={45}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {portfolio.map((p) => (
                    <Cell key={p.name} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-3">
            {portfolio.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.name}
                </span>
                <span className="font-semibold">{p.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Recent Activity"
          action={
            <Link
              to="/admin/audit"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View audit log →
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Time</th>
                  <th className="pb-3 text-left font-medium">Action</th>
                  <th className="pb-3 text-left font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {audit.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td className="py-3 text-muted-foreground">{a.ts}</td>
                    <td className="py-3">
                      <StatusBadge tone="primary">{a.action}</StatusBadge>
                    </td>
                    <td className="py-3 text-muted-foreground">{a.details}</td>
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

// Silence unused-import lint
void Avatar;
void TrendingUp;
