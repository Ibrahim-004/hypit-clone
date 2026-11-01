import { useEffect, useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { refreshAccessToken } from '../lib/api-client';
import { Spinner } from '../components/ui/Spinner';

export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    refreshAccessToken().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!ready) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-label="Loading application"
      >
        <Spinner label="Loading application" />
      </div>
    );
  }
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
