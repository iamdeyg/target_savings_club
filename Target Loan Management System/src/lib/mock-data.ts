import type { Member } from "./loan-engine";

// Generate savings history: N consecutive months ending at Nov 2025
function buildHistory(
  months: number,
  missAt: number[] = [],
): Member["savingsHistory"] {
  const labels = [
    "Dec 2023",
    "Jan 2024",
    "Feb 2024",
    "Mar 2024",
    "Apr 2024",
    "May 2024",
    "Jun 2024",
    "Jul 2024",
    "Aug 2024",
    "Sep 2024",
    "Oct 2024",
    "Nov 2024",
    "Dec 2024",
    "Jan 2025",
    "Feb 2025",
    "Mar 2025",
    "Apr 2025",
    "May 2025",
    "Jun 2025",
    "Jul 2025",
    "Aug 2025",
    "Sep 2025",
    "Oct 2025",
    "Nov 2025",
  ];
  const slice = labels.slice(-months);
  return slice.map((mo, idx) => {
    const missed = missAt.includes(idx);
    return {
      mo,
      paid: missed ? 0 : 5000,
      date: missed ? "—" : `${mo.split(" ")[0]} 3`,
      ok: !missed,
    };
  });
}

export const INITIAL_MEMBERS: Member[] = [
  {
    id: "TSL-001",
    name: "Adaeze Okonkwo",
    initials: "AO",
    color: "#EAF3DE",
    textColor: "#3B6D11",
    phone: "+234 803 111 2201",
    email: "adaeze.okonkwo@example.com",
    address: "12 Ajose Adeogun St, Victoria Island, Lagos",
    employer: "First Bank of Nigeria",
    job: "Senior Accountant",
    bank: "GTBank",
    acct: "0123456781",
    kin: "Chidi Okonkwo",
    kinPhone: "+234 803 555 0011",
    joined: "Dec 2023",
    status: "Active",
    savingsHistory: buildHistory(24),
    loan: {
      ref: "L-001-A",
      original: 150000,
      months: 12,
      monthsPaid: 4,
      startLabel: "Aug 2025",
      nextDueLabel: "Dec 1, 2025",
      overdue: false,
      pending: false,
      purpose: "Home renovation",
      approvedOn: "Jul 28, 2025",
      status: "Active",
    },
  },
  {
    id: "TSL-002",
    name: "Bola Adeyemi",
    initials: "BA",
    color: "#E1F5EE",
    textColor: "#0F6E56",
    phone: "+234 805 222 3302",
    email: "bola.adeyemi@example.com",
    address: "45 Awolowo Rd, Ikoyi, Lagos",
    employer: "Chevron Nigeria",
    job: "Petroleum Engineer",
    bank: "Zenith Bank",
    acct: "2001234562",
    kin: "Funmi Adeyemi",
    kinPhone: "+234 805 555 0022",
    joined: "Dec 2023",
    status: "Active",
    savingsHistory: buildHistory(24),
    loan: null,
  },
  {
    id: "TSL-003",
    name: "Chinedu Eze",
    initials: "CE",
    color: "#E6F1FB",
    textColor: "#185FA5",
    phone: "+234 807 333 4403",
    email: "chinedu.eze@example.com",
    address: "18 Herbert Macaulay Way, Yaba, Lagos",
    employer: "MTN Nigeria",
    job: "Network Engineer",
    bank: "Access Bank",
    acct: "0034567893",
    kin: "Ngozi Eze",
    kinPhone: "+234 807 555 0033",
    joined: "Jan 2024",
    status: "Active",
    savingsHistory: buildHistory(23),
    loan: {
      ref: "L-003-A",
      original: 200000,
      months: 18,
      monthsPaid: 0,
      startLabel: "Dec 2025",
      nextDueLabel: "Dec 5, 2025",
      overdue: false,
      pending: true,
      purpose: "School fees for children",
      status: "Pending",
    },
  },
  {
    id: "TSL-004",
    name: "Deborah Umeh",
    initials: "DU",
    color: "#FAEEDA",
    textColor: "#854F0B",
    phone: "+234 809 444 5504",
    email: "deborah.umeh@example.com",
    address: "7 Bode Thomas St, Surulere, Lagos",
    employer: "UBA Bank",
    job: "Relationship Manager",
    bank: "UBA",
    acct: "2100987654",
    kin: "Emeka Umeh",
    kinPhone: "+234 809 555 0044",
    joined: "Feb 2024",
    status: "Overdue",
    savingsHistory: buildHistory(22, [20, 21]),
    loan: {
      ref: "L-004-A",
      original: 100000,
      months: 10,
      monthsPaid: 3,
      startLabel: "Aug 2025",
      nextDueLabel: "Nov 1, 2025",
      overdue: true,
      pending: false,
      purpose: "Medical emergency",
      approvedOn: "Jul 30, 2025",
      status: "Overdue",
    },
  },
  {
    id: "TSL-005",
    name: "Emeka Nwosu",
    initials: "EN",
    color: "#EAF3DE",
    textColor: "#3B6D11",
    phone: "+234 802 555 6605",
    email: "emeka.nwosu@example.com",
    address: "22 Allen Avenue, Ikeja, Lagos",
    employer: "Dangote Group",
    job: "Logistics Manager",
    bank: "First Bank",
    acct: "3005678902",
    kin: "Amaka Nwosu",
    kinPhone: "+234 802 555 0055",
    joined: "Mar 2024",
    status: "Active",
    savingsHistory: buildHistory(21),
    loan: null,
  },
  {
    id: "TSL-006",
    name: "Fatima Sani",
    initials: "FS",
    color: "#FCEBEB",
    textColor: "#A32D2D",
    phone: "+234 806 666 7706",
    email: "fatima.sani@example.com",
    address: "10 Wuse II, Abuja",
    employer: "Federal Ministry of Finance",
    job: "Policy Analyst",
    bank: "Fidelity Bank",
    acct: "4098765432",
    kin: "Ibrahim Sani",
    kinPhone: "+234 806 555 0066",
    joined: "Apr 2024",
    status: "Active",
    savingsHistory: buildHistory(20),
    loan: {
      ref: "L-006-A",
      original: 80000,
      months: 8,
      monthsPaid: 8,
      startLabel: "Feb 2025",
      nextDueLabel: "—",
      overdue: false,
      pending: false,
      purpose: "Business restocking",
      approvedOn: "Jan 25, 2025",
      status: "Repaid",
    },
  },
  {
    id: "TSL-007",
    name: "Gideon Balogun",
    initials: "GB",
    color: "#E1F5EE",
    textColor: "#0F6E56",
    phone: "+234 803 777 8807",
    email: "gideon.balogun@example.com",
    address: "34 Opebi Rd, Ikeja, Lagos",
    employer: "Interswitch Ltd",
    job: "Software Engineer",
    bank: "Wema Bank",
    acct: "5009876540",
    kin: "Tolu Balogun",
    kinPhone: "+234 803 555 0077",
    joined: "May 2024",
    status: "Active",
    savingsHistory: buildHistory(19),
    loan: null,
  },
  {
    id: "TSL-008",
    name: "Halima Yusuf",
    initials: "HY",
    color: "#FAEEDA",
    textColor: "#854F0B",
    phone: "+234 808 888 9908",
    email: "halima.yusuf@example.com",
    address: "5 Marina Street, Lagos Island",
    employer: "Nigerian Breweries",
    job: "Marketing Executive",
    bank: "Sterling Bank",
    acct: "6001122338",
    kin: "Aisha Yusuf",
    kinPhone: "+234 808 555 0088",
    joined: "Jun 2024",
    status: "Active",
    savingsHistory: buildHistory(18),
    loan: {
      ref: "L-008-A",
      original: 120000,
      months: 15,
      monthsPaid: 0,
      startLabel: "Dec 2025",
      nextDueLabel: "Dec 5, 2025",
      overdue: false,
      pending: true,
      purpose: "Vehicle purchase",
      status: "Pending",
    },
  },
];

export interface Repayment {
  id: string;
  memberId: string;
  loanRef: string;
  month: number;
  principal: number;
  interest: number;
  total: number;
  newBalance: number;
  date: string;
}

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  details: string;
}

export interface Notification {
  id: string;
  icon: "info" | "warn" | "success" | "danger";
  title: string;
  body: string;
  time: string;
}

export const INITIAL_AUDIT: AuditEntry[] = [
  {
    id: "A-1001",
    ts: "Nov 28, 2025 · 09:12",
    actor: "Admin",
    action: "Loan Approved",
    details: "L-001-A · Adaeze Okonkwo · ₦150,000 · 12 months",
  },
  {
    id: "A-1002",
    ts: "Nov 28, 2025 · 10:04",
    actor: "Admin",
    action: "Contribution Recorded",
    details: "TSL-002 · Bola Adeyemi · ₦5,000 for Nov 2025",
  },
  {
    id: "A-1003",
    ts: "Nov 27, 2025 · 14:38",
    actor: "Admin",
    action: "Member Suspended",
    details:
      "TSL-004 · Deborah Umeh · reason: 2 consecutive missed contributions",
  },
  {
    id: "A-1004",
    ts: "Nov 26, 2025 · 16:22",
    actor: "Admin",
    action: "Settings Updated",
    details: "Grace period changed from 5 to 7 days",
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "N-1",
    icon: "warn",
    title: "2 loan applications pending review",
    body: "Chinedu Eze (TSL-003) and Halima Yusuf (TSL-008) submitted new loan applications.",
    time: "2 hours ago",
  },
  {
    id: "N-2",
    icon: "danger",
    title: "Deborah Umeh is overdue",
    body: "TSL-004 has missed the Nov 2025 loan payment. Grace period expires in 2 days.",
    time: "5 hours ago",
  },
  {
    id: "N-3",
    icon: "success",
    title: "Fatima Sani completed loan repayment",
    body: "TSL-006 fully repaid L-006-A (₦80,000 refund + interest).",
    time: "Yesterday",
  },
  {
    id: "N-4",
    icon: "info",
    title: "Monthly contributions due Dec 5",
    body: "8 members have not yet paid the December 2025 contribution.",
    time: "2 days ago",
  },
];
