import type { Metadata } from "next";
import Link from "next/link";
import { MountainSnow } from "lucide-react";
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
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/85 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/85">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
                <MountainSnow size={18} strokeWidth={2} />
              </span>
              <span className="text-lg font-bold tracking-tight">雪讯</span>
              <span className="hidden pt-0.5 text-xs font-normal text-slate-400 sm:inline">
                中国滑雪场情报站
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Link href="/" className="transition hover:text-sky-600 dark:hover:text-sky-400">
                雪场
              </Link>
              <Link href="/boards" className="transition hover:text-sky-600 dark:hover:text-sky-400">
                雪板
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
        <footer className="border-t border-slate-100 py-8 text-center text-xs leading-relaxed text-slate-400 dark:border-slate-800/60">
          <p>数据来源：和风天气及各雪场公开渠道，仅供参考 · 票价以雪场官方发布为准</p>
        </footer>
      </body>
    </html>
  );
}
