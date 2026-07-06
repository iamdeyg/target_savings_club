import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { Avatar } from "@/components/status-badge";
import { useCurrentMember, useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/member/settings")({
  head: () => ({ meta: [{ title: "Settings — Member Portal" }] }),
  component: MemberSettingsPage,
});

function MemberSettingsPage() {
  const member = useCurrentMember();
  const { changeMemberPassword } = useStore();
  const [passwordDraft, setPasswordDraft] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  if (!member) return null;

  const biodata = member.biodata ?? {
    fullName: member.name,
    contactAddress: member.address,
    residentialAddress: member.address,
    phone: member.phone,
    passport: undefined,
    signature: undefined,
  };
  const nextOfKin = member.nextOfKin ?? {
    fullName: member.kin,
    contactAddress: "—",
    residentialAddress: "—",
    phone: member.kinPhone,
    relationship: "—",
    passport: undefined,
  };
  const referee = member.referee ?? {
    fullName: "—",
    phone: "—",
    membershipId: "—",
    signature: undefined,
  };

  const savePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordDraft.next !== passwordDraft.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    const ok = changeMemberPassword(
      member.id,
      passwordDraft.current,
      passwordDraft.next,
    );
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
        subtitle="Review your biodata and manage your password"
      />

      <SectionCard>
        <div className="flex items-center gap-4">
          <Avatar
            initials={member.initials}
            bg={member.color}
            color={member.textColor}
            size="lg"
          />
          <div>
            <div className="text-xl font-bold">{member.name}</div>
            <div className="text-sm text-muted-foreground">
              {member.id} · {member.email}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Biodata">
          <InfoGrid
            rows={[
              ["FullName", biodata.fullName],
              ["Contact Address", biodata.contactAddress],
              ["Residential Address", biodata.residentialAddress],
              ["Phone No", biodata.phone],
              ["Passport", biodata.passport?.name ?? "Not uploaded"],
              ["Signature", biodata.signature?.name ?? "Not uploaded"],
            ]}
          />
        </SectionCard>

        <SectionCard title="Next of Kin">
          <InfoGrid
            rows={[
              ["Name", nextOfKin.fullName],
              ["Relationship", nextOfKin.relationship],
              ["Contact Address", nextOfKin.contactAddress],
              ["Residential Address", nextOfKin.residentialAddress],
              ["Phone No", nextOfKin.phone],
              ["Passport", nextOfKin.passport?.name ?? "Not uploaded"],
            ]}
          />
        </SectionCard>

        <SectionCard title="Referee">
          <InfoGrid
            rows={[
              ["Name", referee.fullName],
              ["Phone No", referee.phone],
              ["Membership ID", referee.membershipId],
              ["Signature", referee.signature?.name ?? "Not uploaded"],
            ]}
          />
        </SectionCard>
      </div>

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
            <div className="flex justify-end md:col-span-3">
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

function InfoGrid({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="space-y-3 text-sm">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </dt>
          <dd className="mt-1 font-medium">{value || "—"}</dd>
        </div>
      ))}
    </dl>
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
  "mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
