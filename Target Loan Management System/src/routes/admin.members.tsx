import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Eye,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { Avatar, StatusBadge } from "@/components/status-badge";
import { useStore, type CreateMemberInput } from "@/lib/store";
import {
  fmtNaira,
  getOutstandingBalance,
  getTotalSavings,
} from "@/lib/loan-engine";
import type { UploadRecord } from "@/lib/loan-engine";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/members")({
  head: () => ({ meta: [{ title: "Members — Admin Portal" }] }),
  component: MembersPage,
});

function MembersPage() {
  const { members, config, createMember } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Active" | "Suspended" | "Overdue"
  >("All");
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const matches =
          m.name.toLowerCase().includes(q.toLowerCase()) ||
          m.id.toLowerCase().includes(q.toLowerCase()) ||
          m.phone.includes(q);
        const status = filter === "All" || m.status === filter;
        return matches && status;
      }),
    [members, q, filter],
  );

  return (
    <>
      <PageHeader title="Members" subtitle={`${members.length} cooperators`} />

      <SectionCard
        title="Member"
        action={
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
          >
            <Plus className="h-4 w-4" /> Add Member
          </button>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, ID, or phone…"
              className="w-full rounded-xl border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1 rounded-xl border bg-background p-1">
            {(["All", "Active", "Suspended", "Overdue"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 text-left font-medium">Member</th>
                <th className="pb-3 text-left font-medium">ID</th>
                <th className="pb-3 text-left font-medium">Phone</th>
                <th className="pb-3 text-right font-medium">Savings</th>
                <th className="pb-3 text-right font-medium">Loan balance</th>
                <th className="pb-3 text-left font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((m) => {
                const loanBalance =
                  m.loan && !m.loan.pending
                    ? getOutstandingBalance(m.loan, config.interestRate)
                    : 0;
                const tone: "success" | "warning" | "danger" | "muted" =
                  m.status === "Active"
                    ? "success"
                    : m.status === "Overdue"
                      ? "danger"
                      : "muted";
                return (
                  <tr key={m.id} className="hover:bg-muted/40">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={m.initials}
                          bg={m.color}
                          color={m.textColor}
                        />
                        <div>
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Joined {m.joined}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-xs">{m.id}</td>
                    <td className="py-3 text-muted-foreground">{m.phone}</td>
                    <td className="py-3 text-right font-semibold">
                      {fmtNaira(getTotalSavings(m))}
                    </td>
                    <td className="py-3 text-right">
                      {loanBalance > 0 ? (
                        <span className="font-semibold text-info">
                          {fmtNaira(loanBalance)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <StatusBadge tone={tone}>{m.status}</StatusBadge>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/admin/members/$id"
                        params={{ id: m.id }}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-primary-soft hover:text-primary-strong"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No members match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {adding && (
        <AddMemberDialog
          onClose={() => setAdding(false)}
          onCreate={(input) => {
            const member = createMember(input);
            toast.success(`${member.name} added as ${member.id}`);
            setAdding(false);
          }}
        />
      )}
    </>
  );
}

const emptyUpload: UploadRecord | undefined = undefined;

const initialMemberInput: CreateMemberInput = {
  email: "",
  temporaryPassword: "password",
  biodata: {
    fullName: "",
    contactAddress: "",
    residentialAddress: "",
    phone: "",
    passport: emptyUpload,
    signature: emptyUpload,
  },
  nextOfKin: {
    fullName: "",
    contactAddress: "",
    residentialAddress: "",
    phone: "",
    relationship: "",
    passport: emptyUpload,
  },
  referee: {
    fullName: "",
    phone: "",
    signature: emptyUpload,
    membershipId: "",
  },
};

function AddMemberDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: CreateMemberInput) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CreateMemberInput>(initialMemberInput);
  const steps = ["Biodata", "Next of Kin", "Referee", "Review"];

  const canContinue =
    step === 0
      ? !!draft.biodata.fullName.trim() &&
        !!draft.biodata.phone.trim() &&
        !!draft.email.trim() &&
        draft.temporaryPassword.length >= 6
      : step === 1
        ? !!draft.nextOfKin.fullName.trim() &&
          !!draft.nextOfKin.phone.trim() &&
          !!draft.nextOfKin.relationship.trim()
        : step === 2
          ? !!draft.referee.fullName.trim() &&
            !!draft.referee.phone.trim() &&
            !!draft.referee.membershipId.trim()
          : true;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="w-full max-w-4xl rounded-2xl border bg-card shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-bold">Add Member</h2>
            <p className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length}: {steps[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b px-5 py-3">
          <div className="grid gap-2 sm:grid-cols-4">
            {steps.map((label, index) => (
              <div
                key={label}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  index === step
                    ? "border-primary bg-primary-soft text-primary-strong"
                    : index < step
                      ? "border-success/40 bg-success-soft text-success"
                      : "bg-background text-muted-foreground"
                }`}
              >
                {index < step ? "Done" : `Step ${index + 1}`} · {label}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="FullName">
                <input
                  value={draft.biodata.fullName}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      biodata: {
                        ...draft.biodata,
                        fullName: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) =>
                    setDraft({ ...draft, email: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Contact Address">
                <input
                  value={draft.biodata.contactAddress}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      biodata: {
                        ...draft.biodata,
                        contactAddress: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Residential Address">
                <input
                  value={draft.biodata.residentialAddress}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      biodata: {
                        ...draft.biodata,
                        residentialAddress: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Phone No">
                <input
                  value={draft.biodata.phone}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      biodata: { ...draft.biodata, phone: e.target.value },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Temporary Password">
                <input
                  type="password"
                  value={draft.temporaryPassword}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      temporaryPassword: e.target.value,
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <FileField
                label="Upload Passport"
                value={draft.biodata.passport}
                onChange={(passport) =>
                  setDraft({
                    ...draft,
                    biodata: { ...draft.biodata, passport },
                  })
                }
              />
              <FileField
                label="Upload Signature"
                value={draft.biodata.signature}
                onChange={(signature) =>
                  setDraft({
                    ...draft,
                    biodata: { ...draft.biodata, signature },
                  })
                }
              />
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Next of Kin">
                <input
                  value={draft.nextOfKin.fullName}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      nextOfKin: {
                        ...draft.nextOfKin,
                        fullName: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Relationship">
                <input
                  value={draft.nextOfKin.relationship}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      nextOfKin: {
                        ...draft.nextOfKin,
                        relationship: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Contact Address">
                <input
                  value={draft.nextOfKin.contactAddress}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      nextOfKin: {
                        ...draft.nextOfKin,
                        contactAddress: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Residential Address">
                <input
                  value={draft.nextOfKin.residentialAddress}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      nextOfKin: {
                        ...draft.nextOfKin,
                        residentialAddress: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Phone No">
                <input
                  value={draft.nextOfKin.phone}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      nextOfKin: { ...draft.nextOfKin, phone: e.target.value },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <FileField
                label="Upload Passport"
                value={draft.nextOfKin.passport}
                onChange={(passport) =>
                  setDraft({
                    ...draft,
                    nextOfKin: { ...draft.nextOfKin, passport },
                  })
                }
              />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Referee">
                <input
                  value={draft.referee.fullName}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      referee: {
                        ...draft.referee,
                        fullName: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Phone No">
                <input
                  value={draft.referee.phone}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      referee: { ...draft.referee, phone: e.target.value },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Membership ID">
                <input
                  value={draft.referee.membershipId}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      referee: {
                        ...draft.referee,
                        membershipId: e.target.value,
                      },
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <FileField
                label="Signature"
                value={draft.referee.signature}
                onChange={(signature) =>
                  setDraft({
                    ...draft,
                    referee: { ...draft.referee, signature },
                  })
                }
              />
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <ReviewBlock
                title="Biodata"
                rows={[
                  ["FullName", draft.biodata.fullName],
                  ["Email", draft.email],
                  ["Contact Address", draft.biodata.contactAddress],
                  ["Residential Address", draft.biodata.residentialAddress],
                  ["Phone No", draft.biodata.phone],
                  ["Passport", draft.biodata.passport?.name ?? "Not uploaded"],
                  ["Signature", draft.biodata.signature?.name ?? "Not uploaded"],
                ]}
              />
              <ReviewBlock
                title="Next of Kin"
                rows={[
                  ["Name", draft.nextOfKin.fullName],
                  ["Relationship", draft.nextOfKin.relationship],
                  ["Contact Address", draft.nextOfKin.contactAddress],
                  ["Residential Address", draft.nextOfKin.residentialAddress],
                  ["Phone No", draft.nextOfKin.phone],
                  ["Passport", draft.nextOfKin.passport?.name ?? "Not uploaded"],
                ]}
              />
              <ReviewBlock
                title="Referee"
                rows={[
                  ["Name", draft.referee.fullName],
                  ["Phone No", draft.referee.phone],
                  ["Membership ID", draft.referee.membershipId],
                  ["Signature", draft.referee.signature?.name ?? "Not uploaded"],
                ]}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
          <button
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < steps.length - 1 ? (
            <button
              disabled={!canContinue}
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => onCreate(draft)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
            >
              <CheckCircle2 className="h-4 w-4" /> Create Member
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FileField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: UploadRecord;
  onChange: (upload: UploadRecord | undefined) => void;
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <label className="mt-1 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed bg-background px-3 py-3 text-sm hover:bg-muted/50">
        <input
          type="file"
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            onChange(
              file
                ? {
                    name: file.name,
                    previewUrl: file.type.startsWith("image/")
                      ? URL.createObjectURL(file)
                      : undefined,
                  }
                : undefined,
            );
          }}
        />
        <span className="min-w-0 truncate text-muted-foreground">
          {value?.name ?? "Choose file"}
        </span>
        <UploadCloud className="h-4 w-4 shrink-0 text-primary" />
      </label>
      {value?.previewUrl && (
        <img
          src={value.previewUrl}
          alt=""
          className="mt-2 h-16 w-16 rounded-lg border object-cover"
        />
      )}
    </div>
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

function ReviewBlock({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <h3 className="font-semibold">{title}</h3>
      <dl className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </dt>
            <dd className="break-words font-medium">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const inputCls =
  "mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
