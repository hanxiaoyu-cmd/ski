import type { LucideIcon } from "lucide-react";

export function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
      <Icon size={18} className="text-sky-600 dark:text-sky-400" strokeWidth={2} />
      {children}
    </h2>
  );
}
