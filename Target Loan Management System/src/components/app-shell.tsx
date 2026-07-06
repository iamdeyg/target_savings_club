import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  ClipboardList,
  History,
  BarChart3,
  ShieldCheck,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  PiggyBank,
  Upload,
  HandCoins,
  CircleDollarSign,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrandBlock, BrandLogo } from "./brand";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const adminNav: NavItem[] = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    to: "/admin/members",
    label: "Members",
    icon: <Users className="h-4 w-4" />,
  },
  {
    to: "/admin/savings",
    label: "Savings Records",
    icon: <Wallet className="h-4 w-4" />,
  },
  {
    to: "/admin/applications",
    label: "Loan Applications",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    to: "/admin/loans",
    label: "Active Loans",
    icon: <HandCoins className="h-4 w-4" />,
  },
  {
    to: "/admin/repayments",
    label: "Repayments",
    icon: <CircleDollarSign className="h-4 w-4" />,
  },
  {
    to: "/admin/reports",
    label: "Reports",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    to: "/admin/audit",
    label: "Audit Log",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    to: "/admin/notifications",
    label: "Notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

const memberNav: NavItem[] = [
  {
    to: "/member",
    label: "My Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    to: "/member/profile",
    label: "My Profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    to: "/member/savings",
    label: "My Savings",
    icon: <PiggyBank className="h-4 w-4" />,
  },
  {
    to: "/member/upload",
    label: "Upload Proof",
    icon: <Upload className="h-4 w-4" />,
  },
  {
    to: "/member/apply",
    label: "Apply for Loan",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    to: "/member/loans",
    label: "My Loans",
    icon: <History className="h-4 w-4" />,
  },
  {
    to: "/member/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export function AppShell({ portal }: { portal: "admin" | "member" }) {
  const nav = portal === "admin" ? adminNav : memberNav;
  const subtitle = portal === "admin" ? "Admin Portal" : "Member Portal";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, currentMemberId, members, logout, notifications } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Redirect if not authenticated for portal
  useEffect(() => {
    if (portal === "admin" && role !== "admin") navigate({ to: "/" });
    if (portal === "member" && role !== "member") navigate({ to: "/" });
  }, [role, portal, navigate]);

  useEffect(() => setMobileOpen(false), [pathname]);

  const currentMember = members.find((m) => m.id === currentMemberId);
  const unreadCount = portal === "admin" ? notifications.length : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
        <BrandBlock subtitle={subtitle} />
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 shrink-0 flex-col border-r bg-sidebar transition-transform md:sticky md:top-0 md:flex md:h-screen md:translate-x-0",
            mobileOpen
              ? "flex translate-x-0"
              : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="hidden items-center gap-3 border-b px-5 py-5 md:flex">
            <BrandBlock subtitle={subtitle} />
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {nav.map((item) => {
              const active =
                item.to === "/admin" || item.to === "/member"
                  ? pathname === item.to
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span className={cn(active ? "" : "text-muted-foreground")}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-3">
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {portal === "admin" ? "AD" : (currentMember?.initials ?? "ME")}
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="truncate font-semibold">
                  {portal === "admin" ? "General Admin" : currentMember?.name}
                </div>
                <div className="truncate text-muted-foreground">
                  {portal === "admin" ? "admin@target.club" : currentMember?.id}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
          />
        )}

        {/* Main */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 hidden items-center justify-between border-b bg-card/80 px-8 py-3 backdrop-blur md:flex">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-8 w-8 rounded-lg" />
              <div className="leading-tight">
                <div className="text-sm font-bold tracking-tight">
                  Target Savings and Loans Club
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {subtitle}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {portal === "admin" && (
                <Link
                  to="/admin/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
              <div className="text-right text-xs">
                <div className="font-semibold">
                  {portal === "admin" ? "General Admin" : currentMember?.name}
                </div>
                <div className="text-muted-foreground">
                  {portal === "admin"
                    ? "System administrator"
                    : currentMember?.id}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
