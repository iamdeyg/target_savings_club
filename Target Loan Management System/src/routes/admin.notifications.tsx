import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/ui-blocks";
import { useStore } from "@/lib/store";
import { Info, AlertTriangle, CheckCircle2, XCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Admin Portal" }] }),
  component: NotificationsPage,
});

const iconMap = {
  info: { Icon: Info, cls: "bg-info-soft text-info" },
  warn: { Icon: AlertTriangle, cls: "bg-warning-soft text-warning" },
  success: { Icon: CheckCircle2, cls: "bg-success-soft text-success" },
  danger: { Icon: XCircle, cls: "bg-destructive-soft text-destructive" },
};

function NotificationsPage() {
  const { notifications } = useStore();

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="System alerts and reminders"
        actions={
          <button
            onClick={() =>
              toast.success("Group notification sent to all members")
            }
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong"
          >
            <Send className="h-4 w-4" /> Send group notification
          </button>
        }
      />
      <SectionCard>
        <ul className="divide-y">
          {notifications.map((n) => {
            const { Icon, cls } = iconMap[n.icon];
            return (
              <li key={n.id} className="flex items-start gap-4 py-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    cls,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {n.time}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </>
  );
}
