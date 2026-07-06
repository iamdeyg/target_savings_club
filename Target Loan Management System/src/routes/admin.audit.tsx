import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { useStore } from "@/lib/store";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Log — Admin Portal" }] }),
  component: AuditPage,
});

function AuditPage() {
  const { audit } = useStore();

  return (
    <>
      <PageHeader title="Audit Log" subtitle="Complete admin action history" />
      <SectionCard>
        <ul className="divide-y">
          {audit.map((a) => (
            <li key={a.id} className="flex items-start gap-4 py-4">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-semibold">{a.action}</div>
                  <div className="text-xs text-muted-foreground">{a.ts}</div>
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {a.details}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  by {a.actor}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
