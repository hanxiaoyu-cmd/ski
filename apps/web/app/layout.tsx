import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "雪讯 — 中国滑雪场天气·雪况·票价一站查询",
    template: "%s | 雪讯",
  },
  description: "聚合中国主要滑雪场的实时天气、雪况、票价与住宿信息，覆盖崇礼、东北、新疆、北京等地区。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span aria-hidden>⛷️</span>
              <span>雪讯</span>
              <span className="hidden text-sm font-normal text-slate-500 sm:inline dark:text-slate-400">
                中国滑雪场情报站
              </span>
            </Link>
            <nav className="text-sm text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
                全部雪场
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>数据来源：和风天气及各雪场公开渠道，仅供参考；票价以雪场官方发布为准。</p>
        </footer>
      </body>
    </html>
  );
}
