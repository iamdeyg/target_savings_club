import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { UploadCloud, FileImage, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/member/upload")({
  head: () => ({ meta: [{ title: "Upload Proof — Member Portal" }] }),
  component: UploadProofPage,
});

function UploadProofPage() {
  const [type, setType] = useState("Monthly contribution");
  const [period, setPeriod] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  return (
    <>
      <PageHeader
        title="Upload Payment Proof"
        subtitle="Attach a bank receipt or transfer screenshot"
      />

      <SectionCard>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Proof of payment submitted for review");
            setFile(null);
            setAmount("");
            setPeriod("");
            setDate("");
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <Field label="Payment type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={inputCls}
            >
              {[
                "Monthly contribution",
                "Loan repayment",
                "Registration fee",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Period / month">
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. Nov 2025"
              className={inputCls}
              required
            />
          </Field>
          <Field label="Amount (₦)">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputCls}
              required
            />
          </Field>
          <Field label="Date paid">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
              required
            />
          </Field>

          <div className="md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Receipt / screenshot
            </span>
            <label
              onDragOver={(e) => {
                e.preventDefault();
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
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-2 shadow-sm">
                  <FileImage className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
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

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={!file}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit for review
            </button>
          </div>
        </form>
      </SectionCard>
    </>
  );
}

const inputCls =
  "mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

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
