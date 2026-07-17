import Link from "next/link";
import { MountainSnow } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-28 text-center">
      <MountainSnow size={56} strokeWidth={1.2} className="text-slate-200 dark:text-slate-700" />
      <h1 className="mt-6 text-xl font-semibold tracking-tight">没有找到这个页面</h1>
      <p className="mt-2 text-sm text-slate-400">可能雪场还未收录，或链接有误</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-sky-600/30 transition hover:bg-sky-700"
      >
        返回全部雪场
      </Link>
    </div>
  );
}
