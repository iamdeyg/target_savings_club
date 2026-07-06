import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CONFIG,
  generateSchedule,
  type Config,
  type Loan,
  type Member,
  type MemberBiodata,
  type NextOfKinDetails,
  type RefereeDetails,
} from "./loan-engine";
import {
  INITIAL_AUDIT,
  INITIAL_MEMBERS,
  INITIAL_NOTIFICATIONS,
  type AuditEntry,
  type Notification,
  type Repayment,
} from "./mock-data";

export type Role = "admin" | "member" | null;

interface StoreState {
  role: Role;
  currentMemberId: string | null;
  adminPassword: string;
  members: Member[];
  config: Config;
  repayments: Repayment[];
  audit: AuditEntry[];
  notifications: Notification[];
}

interface StoreActions {
  authenticateAdmin: (identifier: string, password: string) => boolean;
  authenticateMember: (identifier: string, password: string) => Member | null;
  loginAdmin: () => void;
  loginMember: (memberId: string) => void;
  logout: () => void;

  createMember: (input: CreateMemberInput) => Member;
  updateConfig: (patch: Partial<Config>) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  changeAdminPassword: (currentPassword: string, nextPassword: string) => boolean;
  changeMemberPassword: (
    memberId: string,
    currentPassword: string,
    nextPassword: string,
  ) => boolean;

  approveLoan: (memberId: string) => void;
  rejectLoan: (memberId: string, remarks: string) => void;
  submitLoanApplication: (
    memberId: string,
    original: number,
    months: number,
    purpose: string,
  ) => void;
  recordRepayment: (memberId: string) => void;
  recordSaving: (
    memberId: string,
    mo: string,
    amount: number,
    paidDate?: string,
  ) => void;
  suspendMember: (memberId: string) => void;
  reactivateMember: (memberId: string) => void;
  addAudit: (action: string, details: string) => void;
  addNotification: (n: Omit<Notification, "id" | "time">) => void;
}

export interface CreateMemberInput {
  email: string;
  biodata: MemberBiodata;
  nextOfKin: NextOfKinDetails;
  referee: RefereeDetails;
  temporaryPassword: string;
}

const StoreContext = createContext<(StoreState & StoreActions) | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>(INITIAL_AUDIT);
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS,
  );

  const actions: StoreActions = useMemo(
    () => ({
      authenticateAdmin: (identifier, password) => {
        const normalized = identifier.trim().toLowerCase();
        const isAdmin =
          normalized === "admin" ||
          normalized === "admin@target.club" ||
          normalized === "general admin";
        return isAdmin && password === adminPassword;
      },
      authenticateMember: (identifier, password) => {
        const normalized = identifier.trim().toLowerCase();
        return (
          members.find(
            (m) =>
              (m.id.toLowerCase() === normalized ||
                m.email.toLowerCase() === normalized) &&
              password === (m.password ?? "password"),
          ) ?? null
        );
      },
      loginAdmin: () => {
        setRole("admin");
        setCurrentMemberId(null);
      },
      loginMember: (id) => {
        setRole("member");
        setCurrentMemberId(id);
      },
      logout: () => {
        setRole(null);
        setCurrentMemberId(null);
      },
      updateConfig: (patch) => {
        setConfig((c) => ({ ...c, ...patch }));
        pushAudit(setAudit, "Settings Updated", Object.keys(patch).join(", "));
      },
      createMember: (input) => {
        const nextId = getNextMemberId(members);
        const member: Member = {
          id: nextId,
          name: input.biodata.fullName,
          initials: getInitials(input.biodata.fullName),
          color: getMemberColor(members.length).bg,
          textColor: getMemberColor(members.length).text,
          phone: input.biodata.phone,
          email: input.email,
          address: input.biodata.contactAddress,
          employer: "—",
          job: "—",
          bank: "—",
          acct: "—",
          kin: input.nextOfKin.fullName,
          kinPhone: input.nextOfKin.phone,
          joined: new Date().toLocaleDateString("en-NG", {
            month: "short",
            year: "numeric",
          }),
          status: "Active",
          password: input.temporaryPassword,
          biodata: input.biodata,
          nextOfKin: input.nextOfKin,
          referee: input.referee,
          savingsHistory: buildEmptySavingsHistory(members),
          loan: null,
        };
        setMembers((ms) => [member, ...ms]);
        pushAudit(setAudit, "Member Created", `${member.id} · ${member.name}`);
        return member;
      },
      updateMember: (id, patch) => {
        setMembers((ms) =>
          ms.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        );
      },
      changeAdminPassword: (currentPassword, nextPassword) => {
        if (currentPassword !== adminPassword || nextPassword.length < 6) {
          return false;
        }
        setAdminPassword(nextPassword);
        pushAudit(setAudit, "Admin Password Changed", "General Admin");
        return true;
      },
      changeMemberPassword: (memberId, currentPassword, nextPassword) => {
        const member = members.find((m) => m.id === memberId);
        if (
          !member ||
          currentPassword !== (member.password ?? "password") ||
          nextPassword.length < 6
        ) {
          return false;
        }
        setMembers((ms) =>
          ms.map((m) =>
            m.id === memberId ? { ...m, password: nextPassword } : m,
          ),
        );
        pushAudit(setAudit, "Member Password Changed", memberId);
        return true;
      },
      approveLoan: (memberId) => {
        setMembers((ms) =>
          ms.map((m) => {
            if (m.id !== memberId || !m.loan) return m;
            const loan: Loan = {
              ...m.loan,
              pending: false,
              status: "Active",
              approvedOn: new Date().toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            };
            return { ...m, loan };
          }),
        );
        const member = members.find((m) => m.id === memberId);
        if (member?.loan) {
          pushAudit(
            setAudit,
            "Loan Approved",
            `${member.loan.ref} · ${member.name} · ₦${member.loan.original.toLocaleString()} · ${member.loan.months} months`,
          );
        }
      },
      rejectLoan: (memberId, remarks) => {
        setMembers((ms) =>
          ms.map((m) => {
            if (m.id !== memberId) return m;
            return { ...m, loan: null };
          }),
        );
        const member = members.find((m) => m.id === memberId);
        pushAudit(
          setAudit,
          "Loan Rejected",
          `${member?.loan?.ref ?? ""} · ${member?.name ?? ""} · ${remarks}`,
        );
      },
      submitLoanApplication: (memberId, original, months, purpose) => {
        setMembers((ms) =>
          ms.map((m) => {
            if (m.id !== memberId) return m;
            const ref = `L-${memberId.slice(4)}-${String.fromCharCode(
              65 + (m.loanHistory?.length ?? (m.loan ? 1 : 0)),
            )}`;
            const loan: Loan = {
              ref,
              original,
              months,
              monthsPaid: 0,
              startLabel: "Pending",
              nextDueLabel: "—",
              overdue: false,
              pending: true,
              purpose,
              status: "Pending",
            };
            return { ...m, loan };
          }),
        );
        pushAudit(
          setAudit,
          "Loan Application Submitted",
          `${memberId} · ₦${original.toLocaleString()} · ${months} months`,
        );
      },
      recordRepayment: (memberId) => {
        setMembers((ms) => {
          const next = ms.map((m) => {
            if (m.id !== memberId || !m.loan || m.loan.pending) return m;
            if (m.loan.monthsPaid >= m.loan.months) return m;
            // uses imported generateSchedule
            const sch = generateSchedule(
              m.loan.original,
              m.loan.months,
              config.interestRate,
            );
            const row = sch[m.loan.monthsPaid];
            const newMonthsPaid = m.loan.monthsPaid + 1;
            const repayment: Repayment = {
              id: `R-${Date.now()}-${memberId}`,
              memberId,
              loanRef: m.loan.ref,
              month: row.month,
              principal: row.principal,
              interest: row.interest,
              total: row.totalDue,
              newBalance: row.closingBalance,
              date: new Date().toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            };
            setRepayments((rs) => [repayment, ...rs]);
            const status: Loan["status"] =
              newMonthsPaid >= m.loan.months ? "Repaid" : "Active";
            const loan: Loan = {
              ...m.loan,
              monthsPaid: newMonthsPaid,
              overdue: false,
              status,
              nextDueLabel:
                status === "Repaid"
                  ? "—"
                  : new Date(
                      new Date().setMonth(new Date().getMonth() + 1),
                    ).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
            };
            return { ...m, loan };
          });
          return next;
        });
        pushAudit(setAudit, "Loan Repayment Recorded", `${memberId}`);
      },
      recordSaving: (memberId, mo, amount, paidDate) => {
        const displayDate = paidDate
          ? new Date(paidDate).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
            })
          : new Date().toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
            });
        setMembers((ms) =>
          ms.map((m) => {
            if (m.id !== memberId) return m;
            const existing = m.savingsHistory.find((s) => s.mo === mo);
            if (existing) {
              return {
                ...m,
                savingsHistory: m.savingsHistory.map((s) =>
                  s.mo === mo
                    ? {
                        ...s,
                        paid: amount,
                        ok: true,
                        date: displayDate,
                      }
                    : s,
                ),
              };
            }
            return {
              ...m,
              savingsHistory: [
                ...m.savingsHistory,
                {
                  mo,
                  paid: amount,
                  date: displayDate,
                  ok: true,
                },
              ],
            };
          }),
        );
        pushAudit(
          setAudit,
          "Contribution Recorded",
          `${memberId} · ₦${amount.toLocaleString()} for ${mo}`,
        );
      },
      suspendMember: (memberId) => {
        setMembers((ms) =>
          ms.map((m) =>
            m.id === memberId ? { ...m, status: "Suspended" } : m,
          ),
        );
        pushAudit(setAudit, "Member Suspended", memberId);
      },
      reactivateMember: (memberId) => {
        setMembers((ms) =>
          ms.map((m) => (m.id === memberId ? { ...m, status: "Active" } : m)),
        );
        pushAudit(setAudit, "Member Reactivated", memberId);
      },
      addAudit: (action, details) => pushAudit(setAudit, action, details),
      addNotification: (n) =>
        setNotifications((ns) => [
          { ...n, id: `N-${Date.now()}`, time: "Just now" },
          ...ns,
        ]),
    }),
    [members, config.interestRate, adminPassword],
  );

  const value = useMemo(
    () => ({
      role,
      currentMemberId,
      adminPassword,
      members,
      config,
      repayments,
      audit,
      notifications,
      ...actions,
    }),
    [
      role,
      currentMemberId,
      adminPassword,
      members,
      config,
      repayments,
      audit,
      notifications,
      actions,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

function getNextMemberId(members: Member[]) {
  const max = members.reduce((highest, member) => {
    const num = Number(member.id.replace(/\D/g, ""));
    return Number.isFinite(num) ? Math.max(highest, num) : highest;
  }, 0);
  return `TSL-${String(max + 1).padStart(3, "0")}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getMemberColor(index: number) {
  const colors = [
    { bg: "#EAF3DE", text: "#3B6D11" },
    { bg: "#E1F5EE", text: "#0F6E56" },
    { bg: "#E6F1FB", text: "#185FA5" },
    { bg: "#FAEEDA", text: "#854F0B" },
    { bg: "#FCEBEB", text: "#A32D2D" },
  ];
  return colors[index % colors.length];
}

function buildEmptySavingsHistory(members: Member[]) {
  const months = members[0]?.savingsHistory.map((entry) => entry.mo) ?? [];
  return months.map((mo) => ({
    mo,
    paid: 0,
    date: "—",
    ok: false,
  }));
}

function pushAudit(
  setAudit: React.Dispatch<React.SetStateAction<AuditEntry[]>>,
  action: string,
  details: string,
) {
  setAudit((a) => [
    {
      id: `A-${Date.now()}`,
      ts: new Date().toLocaleString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      actor: "Admin",
      action,
      details,
    },
    ...a,
  ]);
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useCurrentMember() {
  const { members, currentMemberId } = useStore();
  return members.find((m) => m.id === currentMemberId) ?? null;
}
