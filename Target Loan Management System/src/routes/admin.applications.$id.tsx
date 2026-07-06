import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowLeft, Check, X, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { Avatar } from "@/components/status-badge";
import { ScheduleTable } from "@/components/schedule-table";
import { useStore } from "@/lib/store";
import {
  fmtNaira,
  getLoanEligibilityMax,
  getTotalSavings,
  isEligibleForLoan,
} from "@/lib/loan-engine";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/applications/$id")({
  head: () => ({ meta: [{ title: "Review Application — Admin Portal" }] }),
  component: LoanReview,
});

function LoanReview() {
  const { id } = Route.useParams();
  const { members, config, approveLoan, rejectLoan } = useStore();
  const navigate = useNavigate();
  const m = members.find((x) => x.id === id);
  if (!m || !m.loan) throw notFound();

  const { eligible, checks } = isEligibleForLoan(m, config);
  const [remarks, setRemarks] = useState("");

  return (
    <>
      <div className="pb-4">
        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to applications
        </Link>
      </div>

      <PageHeader
        title={`Loan Review · ${m.loan.ref}`}
        subtitle={`${m.name} applied for ${fmtNaira(m.loan.original)} over ${m.loan.months} months`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Applicant" className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <Avatar
              initials={m.initials}
              bg={m.color}
              color={m.textColor}
              size="lg"
            />
            <div>
              <div className="text-lg font-bold">{m.name}</div>
              <div className="text-sm text-muted-foreground">
                {m.id} · {m.job} at {m.employer}
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
            {[
              ["Total savings", fmtNaira(getTotalSavings(m))],
              ["Max eligible", fmtNaira(getLoanEligibilityMax(m, config))],
              ["Requested", fmtNaira(m.loan.original)],
              ["Months", `${m.loan.months} months`],
              ["Rate", `${config.interestRate}% monthly declining`],
              ["Purpose", m.loan.purpose ?? "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {k}
                </dt>
                <dd className="mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Eligibility checks">
          <ul className="space-y-3 text-sm">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    c.passed
                      ? "bg-success text-white"
                      : "bg-destructive text-destructive-foreground",
                  )}
                >
                  {c.passed ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </span>
                <span className={cn(!c.passed && "text-destructive")}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
          <div
            className={cn(
              "mt-4 rounded-xl border p-3 text-xs font-semibold",
              eligible
                ? "border-success/40 bg-success-soft text-success"
                : "border-destructive/40 bg-destructive-soft text-destructive",
            )}
          >
            {eligible
              ? "All checks passed — safe to approve"
              : "Application does not meet requirements"}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Full repayment schedule (live from engine)"
          desc={`${config.interestRate}% monthly declining balance`}
        >
          <ScheduleTable
            principal={m.loan.original}
            months={m.loan.months}
            rate={config.interestRate}
            startLabel={new Date().toLocaleDateString("en-NG", {
              month: "short",
              year: "numeric",
            })}
          />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Admin remarks">
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add remarks or conditions for the applicant…"
            className="h-24 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <button
              onClick={() => {
                rejectLoan(m.id, remarks || "No remarks");
                toast.error(`Application ${m.loan!.ref} rejected`);
                navigate({ to: "/admin/applications" });
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive-soft px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
            <button
              onClick={() => {
                approveLoan(m.id);
                toast.success(`Loan ${m.loan!.ref} approved`);
                navigate({ to: "/admin/loans" });
              }}
              disabled={!eligible}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve
            </button>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
