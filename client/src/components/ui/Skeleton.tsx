export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div aria-label="Loading" className={`animate-pulse rounded-lg bg-surface2 ${className}`} />
  );
}
