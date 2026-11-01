export type SaveStatusValue = 'idle' | 'saving' | 'saved' | 'failed';

export function SaveStatus({ status }: { status: SaveStatusValue }) {
  const label =
    status === 'saving'
      ? 'Saving…'
      : status === 'saved'
        ? 'Saved'
        : status === 'failed'
          ? 'Save failed'
          : 'Ready';
  return (
    <span
      aria-live="polite"
      className={`rounded-full px-3 py-1 text-xs font-medium ${status === 'failed' ? 'bg-danger text-ink' : status === 'saved' ? 'bg-success text-ink' : 'bg-surface2 text-muted'}`}
    >
      {label}
    </span>
  );
}
