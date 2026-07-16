import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-5xl" aria-hidden>
        🏔️
      </p>
      <h1 className="mt-4 text-xl font-semibold">没有找到这个页面</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        可能雪场还未收录，或链接有误。
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        返回全部雪场
      </Link>
    </div>
  );
}
