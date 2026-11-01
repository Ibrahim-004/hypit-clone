import { Skeleton } from '../../../components/ui/Skeleton';
export function ProjectListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading projects">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}
