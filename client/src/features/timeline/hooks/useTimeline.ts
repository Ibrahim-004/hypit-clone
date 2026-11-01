import { useCallback } from 'react';
import { useUndoRedo } from './useUndoRedo';
import type { ClientScene } from '../types';

export function useTimeline(initial: ClientScene[]) {
  const {
    present: scenes,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useUndoRedo<ClientScene[]>(initial);

  const updateScene = useCallback(
    (id: string, patch: Partial<ClientScene>) => {
      set((prev) => prev.map((scene) => (scene.id === id ? { ...scene, ...patch } : scene)));
    },
    [set],
  );

  const addScene = useCallback(() => {
    set((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        order: prev.length,
        text: 'New scene',
        duration: 5,
        visual: 'Describe the visual for this scene',
        transition: 'fade',
      },
    ]);
  }, [set]);

  const deleteScene = useCallback(
    (id: string) => {
      set((prev) =>
        prev.filter((scene) => scene.id !== id).map((scene, index) => ({ ...scene, order: index })),
      );
    },
    [set],
  );

  const moveScene = useCallback(
    (id: string, direction: -1 | 1) => {
      set((prev) => {
        const index = prev.findIndex((scene) => scene.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(index, 1);
        if (!moved) return prev;
        next.splice(target, 0, moved);
        return next.map((scene, i) => ({ ...scene, order: i }));
      });
    },
    [set],
  );

  const reorder = useCallback(
    (orderedIds: string[]) => {
      set((prev) => {
        const byId = new Map(prev.map((scene) => [scene.id, scene]));
        const next: ClientScene[] = [];
        for (const id of orderedIds) {
          const scene = byId.get(id);
          if (scene) next.push(scene);
        }
        return next.map((scene, index) => ({ ...scene, order: index }));
      });
    },
    [set],
  );

  return {
    scenes,
    setScenes: set,
    resetScenes: reset,
    updateScene,
    addScene,
    deleteScene,
    moveScene,
    reorder,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
