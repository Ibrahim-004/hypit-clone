import { useCallback, useState } from 'react';

export function useUndoRedo<T>(initial: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setPresent((prev) => {
      const value = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      setPast((p) => [...p, prev]);
      setFuture([]);
      return value;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1] as T;
      setPresent((current) => {
        setFuture((f) => [current, ...f]);
        return previous;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0] as T;
      setPresent((current) => {
        setPast((p) => [...p, current]);
        return next;
      });
      return f.slice(1);
    });
  }, []);

  const reset = useCallback((value: T) => {
    setPast([]);
    setFuture([]);
    setPresent(value);
  }, []);

  return { present, set, undo, redo, reset, canUndo: past.length > 0, canRedo: future.length > 0 };
}
