import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Download, Database } from "lucide-react";
import type { Config } from "@/lib/loan-engine";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin Portal" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { config, updateConfig, changeAdminPassword } = useStore();
  const [draft, setDraft] = useState<Config>(() => ({ ...config }));
  const [passwordDraft, setPasswordDraft] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  useEffect(() => {
    setDraft({ ...config });
  }, [config]);

  const updateDraft = <K extends keyof Config>(key: K, value: Config[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateNumberDraft = <K extends keyof Config>(
    key: K,
    value: string,
  ) => {
    const next = Number(value);
    if (Number.isFinite(next)) {
      updateDraft(key, next as Config[K]);
    }
  };

  const saveSettings = () => {
    updateConfig({
      ...draft,
      monthlyContribution: Math.max(0, draft.monthlyContribution),
      contributionDueDay: clamp(draft.contributionDueDay, 1, 28),
      gracePeriodDays: Math.max(0, draft.gracePeriodDays),
      interestRate: Math.max(0, draft.interestRate),
      maxRepaymentMonths: clamp(draft.maxRepaymentMonths, 1, 36),
      minMonthsForEligibility: Math.max(0, draft.minMonthsForEligibility),
      maxLoanMultiplier: Math.max(0, draft.maxLoanMultiplier),
    });
    toast.success("Settings saved");
  };

  const savePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordDraft.next !== passwordDraft.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    const ok = changeAdminPassword(passwordDraft.current, passwordDraft.next);
    if (!ok) {
      toast.error("Current password is incorrect or new password is too short");
      return;
    }
    setPasswordDraft({ current: "", next: "", confirm: "" });
    toast.success("Password changed");
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure cooperative rules and templates"
      />

      <form
        className="grid gap-6 lg:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          saveSettings();
        }}
      >
        <SectionCard title="Cooperative">
          <Field label="Cooperative name">
            <input
              value={draft.cooperativeName}
              onChange={(e) => updateDraft("cooperativeName", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Monthly contribution (₦)">
            <input
              type="number"
              min={0}
              value={draft.monthlyContribution}
              onChange={(e) =>
                updateNumberDraft("monthlyContribution", e.target.value)
              }
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due day">
              <input
                type="number"
                min={1}
                max={28}
                value={draft.contributionDueDay}
                onChange={(e) =>
                  updateNumberDraft("contributionDueDay", e.target.value)
                }
                className={inputCls}
              />
            </Field>
            <Field label="Grace period (days)">
              <input
                type="number"
                min={0}
                value={draft.gracePeriodDays}
                onChange={(e) =>
                  updateNumberDraft("gracePeriodDays", e.target.value)
                }
                className={inputCls}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Loan rules">
          <Field label="Interest rate (% monthly declining)">
            <input
              type="number"
              min={0}
              step="0.1"
              value={draft.interestRate}
              onChange={(e) => updateNumberDraft("interestRate", e.target.value)}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max repayment months">
              <input
                type="number"
                min={1}
                max={36}
                value={draft.maxRepaymentMonths}
                onChange={(e) =>
                  updateNumberDraft("maxRepaymentMonths", e.target.value)
                }
                className={inputCls}
              />
            </Field>
            <Field label="Min months for eligibility">
              <input
                type="number"
                min={0}
                value={draft.minMonthsForEligibility}
                onChange={(e) =>
                  updateNumberDraft("minMonthsForEligibility", e.target.value)
                }
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Max loan multiplier (× savings)">
            <input
              type="number"
              min={0}
              step="0.5"
              value={draft.maxLoanMultiplier}
              onChange={(e) =>
                updateNumberDraft("maxLoanMultiplier", e.target.value)
              }
              className={inputCls}
            />
          </Field>
        </SectionCard>

        <SectionCard title="SMS template" className="lg:col-span-1">
          <textarea
            value={draft.smsTemplate}
            onChange={(e) => updateDraft("smsTemplate", e.target.value)}
            className="h-32 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Placeholders: {"{name}"}, {"{amount}"}, {"{date}"}. Must be signed
            off: "— Target Savings and Loans Club".
          </p>
        </SectionCard>

        <SectionCard title="WhatsApp template" className="lg:col-span-1">
          <textarea
            value={draft.whatsappTemplate}
            onChange={(e) =>
              updateDraft("whatsappTemplate", e.target.value)
            }
            className="h-32 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </SectionCard>

        <SectionCard title="System" className="lg:col-span-2">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Database className="h-4 w-4" /> Backup database
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </SectionCard>
        <div className="flex justify-end lg:col-span-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
          >
            <Save className="h-4 w-4" /> Save changes
          </button>
        </div>
      </form>

      <div className="mt-6">
        <SectionCard title="Change password">
          <form onSubmit={savePassword} className="grid gap-4 md:grid-cols-3">
            <Field label="Current password">
              <input
                type="password"
                value={passwordDraft.current}
                onChange={(e) =>
                  setPasswordDraft({
                    ...passwordDraft,
                    current: e.target.value,
                  })
                }
                className={inputCls}
                required
              />
            </Field>
            <Field label="New password">
              <input
                type="password"
                minLength={6}
                value={passwordDraft.next}
                onChange={(e) =>
                  setPasswordDraft({ ...passwordDraft, next: e.target.value })
                }
                className={inputCls}
                required
              />
            </Field>
            <Field label="Confirm password">
              <input
                type="password"
                minLength={6}
                value={passwordDraft.confirm}
                onChange={(e) =>
                  setPasswordDraft({
                    ...passwordDraft,
                    confirm: e.target.value,
                  })
                }
                className={inputCls}
                required
              />
            </Field>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
              >
                <Save className="h-4 w-4" /> Update password
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
