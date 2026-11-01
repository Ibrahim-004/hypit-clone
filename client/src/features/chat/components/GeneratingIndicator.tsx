import { Spinner } from '../../../components/ui/Spinner';
export function GeneratingIndicator() {
  return (
    <p aria-live="polite" className="flex items-center gap-2 text-sm text-muted">
      <Spinner label="Generating scenes" /> Generating scenes…
    </p>
  );
}
