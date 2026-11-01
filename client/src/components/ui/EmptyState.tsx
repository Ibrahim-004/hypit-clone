import type { ReactNode } from 'react';
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2 text-sm text-muted">{children}</div>
    </div>
  );
}
