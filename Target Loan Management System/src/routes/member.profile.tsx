import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { Avatar } from "@/components/status-badge";
import { useCurrentMember, useStore } from "@/lib/store";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/member/profile")({
  head: () => ({ meta: [{ title: "My Profile — Member Portal" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const m = useCurrentMember();
  const { updateMember } = useStore();
  const [draft, setDraft] = useState({
    phone: m?.phone ?? "",
    email: m?.email ?? "",
    address: m?.address ?? "",
    kin: m?.kin ?? "",
    kinPhone: m?.kinPhone ?? "",
  });
  if (!m) return null;

  return (
    <>
      <PageHeader title="My Profile" subtitle="View and update your details" />

      <SectionCard>
        <div className="flex items-center gap-4 border-b pb-6">
          <Avatar
            initials={m.initials}
            bg={m.color}
            color={m.textColor}
            size="lg"
          />
          <div>
            <div className="text-xl font-bold">{m.name}</div>
            <div className="text-sm text-muted-foreground">
              {m.id} · Joined {m.joined}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ReadOnly label="Full name" value={m.name} />
          <ReadOnly label="Member ID" value={m.id} />
          <ReadOnly label="Employer" value={m.employer} />
          <ReadOnly label="Job title" value={m.job} />
          <ReadOnly label="Bank" value={m.bank} />
          <ReadOnly label="Account number" value={m.acct} />

          <Editable
            label="Phone"
            value={draft.phone}
            onChange={(v) => setDraft({ ...draft, phone: v })}
          />
          <Editable
            label="Email"
            value={draft.email}
            onChange={(v) => setDraft({ ...draft, email: v })}
          />
          <div className="md:col-span-2">
            <Editable
              label="Address"
              value={draft.address}
              onChange={(v) => setDraft({ ...draft, address: v })}
            />
          </div>
          <Editable
            label="Next of kin"
            value={draft.kin}
            onChange={(v) => setDraft({ ...draft, kin: v })}
          />
          <Editable
            label="Next of kin phone"
            value={draft.kinPhone}
            onChange={(v) => setDraft({ ...draft, kinPhone: v })}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              updateMember(m.id, draft);
              toast.success("Profile updated");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
          >
            <Save className="h-4 w-4" /> Save changes
          </button>
        </div>
      </SectionCard>
    </>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 rounded-xl border bg-muted/40 px-3 py-2 text-sm">
        {value}
      </div>
    </div>
  );
}

function Editable({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
