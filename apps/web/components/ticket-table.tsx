import type { TicketProduct } from "@ski/shared";
import { DAY_TYPE_LABELS, TICKET_TYPE_LABELS, formatPrice } from "@ski/shared";

export function TicketTable({ tickets }: { tickets: TicketProduct[] }) {
  if (tickets.length === 0) {
    return (
      <p className="rounded-xl bg-slate-100 py-8 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
        票价信息整理中，以雪场官方渠道为准
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <th className="px-4 py-2.5 font-medium">票种</th>
            <th className="px-4 py-2.5 font-medium">类型</th>
            <th className="px-4 py-2.5 font-medium">适用</th>
            <th className="px-4 py-2.5 text-right font-medium">价格</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr
              key={t.id}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
            >
              <td className="px-4 py-2.5">{t.name}</td>
              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                {TICKET_TYPE_LABELS[t.ticketType]}
              </td>
              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                {DAY_TYPE_LABELS[t.dayType]}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold">
                {formatPrice(t.priceCents)}
                {t.originalPriceCents !== null && t.originalPriceCents > t.priceCents && (
                  <span className="ml-1.5 text-xs font-normal text-slate-400 line-through">
                    {formatPrice(t.originalPriceCents)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
