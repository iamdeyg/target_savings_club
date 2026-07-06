// ============================================================================
// TARGET SAVINGS AND LOANS CLUB — Core Loan Engine
// Single source of truth for ALL loan figures across the application.
// ============================================================================

export interface ScheduleRow {
  month: number;
  openingBalance: number;
  interest: number;
  principal: number;
  totalDue: number;
  closingBalance: number;
}

export function generateSchedule(
  principal: number,
  months: number,
  ratePercent: number,
): ScheduleRow[] {
  const rate = ratePercent / 100;
  const monthlyPrincipal = principal / months;
  let balance = principal;
  const rows: ScheduleRow[] = [];
  for (let i = 1; i <= months; i++) {
    const interest = balance * rate;
    const totalDue = monthlyPrincipal + interest;
    const closingBalance = Math.max(0, balance - monthlyPrincipal);
    rows.push({
      month: i,
      openingBalance: balance,
      interest,
      principal: monthlyPrincipal,
      totalDue,
      closingBalance,
    });
    balance = closingBalance;
  }
  return rows;
}

// ----------------------------------------------------------------------------
// Admin-configurable system settings
// ----------------------------------------------------------------------------
export interface Config {
  cooperativeName: string;
  monthlyContribution: number;
  contributionDueDay: number;
  gracePeriodDays: number;
  interestRate: number;
  maxRepaymentMonths: number;
  minMonthsForEligibility: number;
  maxLoanMultiplier: number;
  smsTemplate: string;
  whatsappTemplate: string;
}

export const DEFAULT_CONFIG: Config = {
  cooperativeName: "Target Savings and Loans Club",
  monthlyContribution: 5000,
  contributionDueDay: 5,
  gracePeriodDays: 7,
  interestRate: 1,
  maxRepaymentMonths: 18,
  minMonthsForEligibility: 6,
  maxLoanMultiplier: 2,
  smsTemplate:
    "Dear {name}, your monthly contribution of ₦{amount} is due on {date}. — Target Savings and Loans Club",
  whatsappTemplate:
    "Hello {name}, this is a reminder that your loan payment of ₦{amount} is due on {date}. Thank you. — Target Savings and Loans Club",
};

// ----------------------------------------------------------------------------
// Domain types
// ----------------------------------------------------------------------------
export interface SavingsEntry {
  mo: string;
  paid: number;
  date: string;
  ok: boolean;
}

export interface UploadRecord {
  name: string;
  previewUrl?: string;
}

export interface MemberBiodata {
  fullName: string;
  contactAddress: string;
  residentialAddress: string;
  phone: string;
  passport?: UploadRecord;
  signature?: UploadRecord;
}

export interface NextOfKinDetails {
  fullName: string;
  contactAddress: string;
  residentialAddress: string;
  phone: string;
  relationship: string;
  passport?: UploadRecord;
}

export interface RefereeDetails {
  fullName: string;
  phone: string;
  signature?: UploadRecord;
  membershipId: string;
}

export interface Loan {
  ref: string;
  original: number;
  months: number;
  monthsPaid: number;
  startLabel: string;
  nextDueLabel: string;
  overdue: boolean;
  pending: boolean;
  purpose?: string;
  approvedOn?: string;
  status?: "Active" | "Repaid" | "Overdue" | "Pending" | "Rejected";
}

export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
  textColor: string;
  phone: string;
  email: string;
  address: string;
  employer: string;
  job: string;
  bank: string;
  acct: string;
  kin: string;
  kinPhone: string;
  joined: string;
  status: "Active" | "Suspended" | "Overdue";
  password?: string;
  biodata?: MemberBiodata;
  nextOfKin?: NextOfKinDetails;
  referee?: RefereeDetails;
  savingsHistory: SavingsEntry[];
  loan: Loan | null;
  loanHistory?: Loan[];
}

// ----------------------------------------------------------------------------
// Derived selectors — ALWAYS computed, never stored.
// ----------------------------------------------------------------------------
export function getSchedule(loan: Loan, rate: number): ScheduleRow[] {
  return generateSchedule(loan.original, loan.months, rate);
}

export function getOutstandingBalance(loan: Loan, rate: number): number {
  const sch = getSchedule(loan, rate);
  if (loan.monthsPaid >= loan.months) return 0;
  return sch[loan.monthsPaid].openingBalance;
}

export function getCurrentMonthPayment(loan: Loan, rate: number): number {
  const sch = getSchedule(loan, rate);
  if (loan.monthsPaid >= loan.months) return 0;
  return sch[loan.monthsPaid].totalDue;
}

export function getCurrentMonthRow(
  loan: Loan,
  rate: number,
): ScheduleRow | null {
  const sch = getSchedule(loan, rate);
  if (loan.monthsPaid >= loan.months) return null;
  return sch[loan.monthsPaid];
}

export function getTotalInterest(loan: Loan, rate: number): number {
  return getSchedule(loan, rate).reduce((t, r) => t + r.interest, 0);
}

export function getTotalRepayable(loan: Loan, rate: number): number {
  return loan.original + getTotalInterest(loan, rate);
}

export function getInterestPaid(loan: Loan, rate: number): number {
  return getSchedule(loan, rate)
    .slice(0, loan.monthsPaid)
    .reduce((t, r) => t + r.interest, 0);
}

export function getPrincipalPaid(loan: Loan, rate: number): number {
  return getSchedule(loan, rate)
    .slice(0, loan.monthsPaid)
    .reduce((t, r) => t + r.principal, 0);
}

export function getTotalSavings(member: Member): number {
  return member.savingsHistory
    .filter((s) => s.ok)
    .reduce((t, s) => t + s.paid, 0);
}

export function getMissedCount(member: Member): number {
  return member.savingsHistory.filter((s) => !s.ok).length;
}

export function getLoanEligibilityMax(member: Member, cfg: Config): number {
  return getTotalSavings(member) * cfg.maxLoanMultiplier;
}

export function isEligibleForLoan(
  member: Member,
  cfg: Config,
): {
  eligible: boolean;
  checks: { label: string; passed: boolean }[];
} {
  const monthsActive = member.savingsHistory.length;
  const missed = getMissedCount(member);
  const checks = [
    {
      label: `At least ${cfg.minMonthsForEligibility} months of active membership`,
      passed: monthsActive >= cfg.minMonthsForEligibility,
    },
    {
      label: "No active outstanding loan",
      passed: !member.loan || !!member.loan.pending,
    },
    { label: "No missed contributions in last 3 months", passed: missed === 0 },
    {
      label: "Account in good standing (not suspended)",
      passed: member.status !== "Suspended",
    },
  ];
  return { eligible: checks.every((c) => c.passed), checks };
}

// ----------------------------------------------------------------------------
// Formatting
// ----------------------------------------------------------------------------
export function fmtNaira(n: number): string {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

export function fmtNairaExact(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
