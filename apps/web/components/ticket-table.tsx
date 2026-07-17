import type { TicketProduct } from "@ski/shared";
import { DAY_TYPE_LABELS, TICKET_TYPE_LABELS, formatPrice } from "@ski/shared";

export function TicketTable({ tickets }: { tickets: TicketProduct[] }) {
  if (tickets.length === 0) {
    return (
      <p className="rounded-2xl bg-slate-50 py-8 text-center text-sm text-slate-400 dark:bg-slate-900">
        票价信息整理中，以雪场官方渠道为准
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-400 dark:border-slate-800/80">
            <th className="px-5 py-3 font-medium">票种</th>
            <th className="px-5 py-3 font-medium">类型</th>
            <th className="px-5 py-3 font-medium">适用</th>
            <th className="px-5 py-3 text-right font-medium">价格</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
              <td className="px-5 py-3 font-medium">{t.name}</td>
              <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                {TICKET_TYPE_LABELS[t.ticketType]}
              </td>
              <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                {DAY_TYPE_LABELS[t.dayType]}
              </td>
              <td className="px-5 py-3 text-right font-semibold text-sky-700 dark:text-sky-400">
                {formatPrice(t.priceCents)}
                {t.originalPriceCents !== null && t.originalPriceCents > t.priceCents && (
                  <span className="ml-1.5 text-xs font-normal text-slate-300 line-through dark:text-slate-500">
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
