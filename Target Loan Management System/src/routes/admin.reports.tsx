import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard, StatCard } from "@/components/ui-blocks";
import { useStore } from "@/lib/store";
import {
  fmtNaira,
  getOutstandingBalance,
  getTotalSavings,
} from "@/lib/loan-engine";
import {
  Wallet,
  HandCoins,
  Users,
  TrendingUp,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin Portal" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { members, config } = useStore();
  const [type, setType] = useState("Financial Snapshot");
  const [range, setRange] = useState("Last 6 months");
  const [memberId, setMemberId] = useState("all");

  const reportSummary = useMemo(() => {
    const filtered =
      memberId === "all" ? members : members.filter((m) => m.id === memberId);
    return {
      totalSavings: filtered.reduce((t, m) => t + getTotalSavings(m), 0),
      totalOutstanding: filtered
        .filter((m) => m.loan && !m.loan.pending)
        .reduce(
          (t, m) => t + getOutstandingBalance(m.loan!, config.interestRate),
          0,
        ),
      activeCount: filtered.filter((m) => m.status === "Active").length,
    };
  }, [members, memberId, config.interestRate]);

  return (
    <>
      <PageHeader title="Reports" subtitle="Financial insights and exports" />

      <SectionCard title="Report configuration">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Report type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={inputCls}
            >
              {[
                "Financial Snapshot",
                "Savings Summary",
                "Loan Portfolio",
                "Member Activity",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Date range">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className={inputCls}
            >
              {[
                "Last 3 months",
                "Last 6 months",
                "Year to date",
                "All time",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Member filter">
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className={inputCls}
            >
              <option value="all">All members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </Field>
        </div>
      </SectionCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total savings pool"
          value={fmtNaira(reportSummary.totalSavings)}
          icon={<Wallet className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Outstanding loans"
          value={fmtNaira(reportSummary.totalOutstanding)}
          icon={<HandCoins className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="Active members"
          value={reportSummary.activeCount}
          icon={<Users className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Portfolio health"
          value={
            reportSummary.totalSavings > 0
              ? `${Math.round((1 - reportSummary.totalOutstanding / (reportSummary.totalSavings * config.maxLoanMultiplier)) * 100)}%`
              : "—"
          }
          icon={<TrendingUp className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          onClick={() => toast.success("PDF export generated")}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          <FileText className="h-4 w-4" /> Export PDF
        </button>
        <button
          onClick={() => toast.success("Excel export generated")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export Excel
        </button>
      </div>
    </>
  );
}

const inputCls =
  "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
