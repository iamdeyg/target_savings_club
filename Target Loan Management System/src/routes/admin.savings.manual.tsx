import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileImage, UploadCloud, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/savings/manual")({
  validateSearch: (search: Record<string, unknown>) => ({
    month: typeof search.month === "string" ? search.month : undefined,
  }),
  head: () => ({ meta: [{ title: "Manual Record — Admin Portal" }] }),
  component: ManualSavingsRecordPage,
});

function ManualSavingsRecordPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { members, config, recordSaving } = useStore();
  const [period, setPeriod] = useState(
    search.month || members[0]?.savingsHistory.at(-1)?.mo || "",
  );
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState(String(config.monthlyContribution));
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const pendingMembers = useMemo(
    () =>
      members.filter((member) => {
        const entry = member.savingsHistory.find((s) => s.mo === period);
        return !entry?.ok;
      }),
    [members, period],
  );

  const selectedMemberId = memberId || pendingMembers[0]?.id || "";

  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files[0]) setFile(event.dataTransfer.files[0]);
  };

  return (
    <>
      <div className="pb-4">
        <Link
          to="/admin/savings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to savings records
        </Link>
      </div>

      <PageHeader
        title="Manual Record"
        subtitle="Record a member payment that was submitted outside the portal"
      />

      <SectionCard>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!selectedMemberId) {
              toast.error("No pending member selected");
              return;
            }
            recordSaving(selectedMemberId, period, Number(amount), date);
            toast.success("Manual payment record saved");
            navigate({ to: "/admin/savings" });
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <Field label="Member pending payment">
            <select
              value={selectedMemberId}
              onChange={(event) => setMemberId(event.target.value)}
              className={inputCls}
              required
            >
              {pendingMembers.length === 0 && (
                <option value="">No pending members for this period</option>
              )}
              {pendingMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.id})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Period / month">
            <input
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value);
                setMemberId("");
              }}
              placeholder="e.g. Nov 2025"
              className={inputCls}
              required
            />
          </Field>
          <Field label="Payment type">
            <input value="Monthly contribution" className={inputCls} readOnly />
          </Field>
          <Field label="Amount (₦)">
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={inputCls}
              required
            />
          </Field>
          <Field label="Date paid">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputCls}
              required
            />
          </Field>

          <div className="md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Receipt / screenshot
            </span>
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition ${
                dragging
                  ? "border-primary bg-primary-soft"
                  : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/40"
              }`}
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                className="sr-only"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-2 shadow-sm">
                  <FileImage className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">{file.name}</span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setFile(null);
                    }}
                    className="rounded-full p-1 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-10 w-10 text-muted-foreground" />
                  <div className="text-sm font-semibold">
                    Drop file here or click to browse
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PNG, JPG or PDF · Max 10MB
                  </div>
                </>
              )}
            </label>
          </div>

          <div className="flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={!file || !selectedMemberId || pendingMembers.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save manual record
            </button>
          </div>
        </form>
      </SectionCard>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";
