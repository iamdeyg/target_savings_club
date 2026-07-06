import { cn } from "@/lib/utils";
import { fmtNairaExact, generateSchedule } from "@/lib/loan-engine";
import { useMemo } from "react";

interface Props {
  principal: number;
  months: number;
  rate: number;
  monthsPaid?: number;
  overdue?: boolean;
  startLabel?: string;
  compact?: boolean;
}

// Human-friendly labels: derive month names from a start label like "Aug 2025"
function labelForMonth(start: string | undefined, idx: number): string {
  if (!start) return `Month ${idx + 1}`;
  const [monShort, yr] = start.split(" ");
  const mons = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const startIdx = mons.indexOf(monShort);
  const year = parseInt(yr) || new Date().getFullYear();
  if (startIdx < 0) return `Month ${idx + 1}`;
  const total = startIdx + idx;
  const finalMon = mons[total % 12];
  const finalYr = year + Math.floor(total / 12);
  return `${finalMon} ${finalYr}`;
}

export function ScheduleTable({
  principal,
  months,
  rate,
  monthsPaid = 0,
  overdue = false,
  startLabel,
  compact = false,
}: Props) {
  const rows = useMemo(
    () => (principal && months ? generateSchedule(principal, months, rate) : []),
    [principal, months, rate],
  );
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          interest: acc.interest + row.interest,
          principal: acc.principal + row.principal,
        }),
        { interest: 0, principal: 0 },
      ),
    [rows],
  );
  const totalInterest = totals.interest;
  const totalPrincipal = totals.principal;
  const totalDue = totalPrincipal + totalInterest;

  if (!principal || !months) return null;

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">#</th>
            {!compact && (
              <th className="px-4 py-3 text-left font-semibold">Period</th>
            )}
            <th className="px-4 py-3 text-right font-semibold">Opening</th>
            <th className="px-4 py-3 text-right font-semibold">Refund</th>
            <th className="px-4 py-3 text-right font-semibold">Interest</th>
            <th className="px-4 py-3 text-right font-semibold">Total due</th>
            <th className="px-4 py-3 text-right font-semibold">Closing</th>
            <th className="px-4 py-3 text-center font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => {
            const paid = i < monthsPaid;
            const current = i === monthsPaid;
            const isOverdueRow = current && overdue;
            return (
              <tr
                key={r.month}
                className={cn(
                  "transition",
                  paid && "bg-muted/30 text-muted-foreground",
                  current &&
                    !isOverdueRow &&
                    "bg-primary-soft/70 font-semibold",
                  isOverdueRow && "bg-destructive-soft font-semibold",
                )}
              >
                <td className="px-4 py-2.5">{r.month}</td>
                {!compact && (
                  <td className="px-4 py-2.5 text-xs">
                    {labelForMonth(startLabel, i)}
                  </td>
                )}
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {fmtNairaExact(r.openingBalance)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {fmtNairaExact(r.principal)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {fmtNairaExact(r.interest)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                  {fmtNairaExact(r.totalDue)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {fmtNairaExact(r.closingBalance)}
                </td>
                <td className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">
                  {paid && <span className="text-success">Paid</span>}
                  {isOverdueRow && (
                    <span className="text-destructive">Overdue</span>
                  )}
                  {current && !isOverdueRow && (
                    <span className="text-primary">Due now</span>
                  )}
                  {!paid && !current && (
                    <span className="text-muted-foreground">Upcoming</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t-2 bg-muted/60 text-sm font-bold">
          <tr>
            <td className="px-4 py-3" colSpan={compact ? 2 : 3}>
              Totals
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {fmtNairaExact(totalPrincipal)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {fmtNairaExact(totalInterest)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {fmtNairaExact(totalDue)}
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
