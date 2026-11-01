import { Skeleton } from '../../../components/ui/Skeleton';
export function TimelineSkeleton() {
  return (
    <div aria-label="Loading timeline" className="flex flex-col gap-3">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  );
}
