import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ClientScene } from '../../timeline/types';

export function SceneStage({ scene }: { scene: ClientScene | undefined }) {
  const reduceMotion = useReducedMotion();
  if (!scene)
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-ink text-muted">
        No scene to preview
      </div>
    );
  const initial = reduceMotion
    ? { opacity: 0 }
    : scene.transition === 'slide'
      ? { opacity: 0, x: 60 }
      : scene.transition === 'zoom'
        ? { opacity: 0, scale: 0.9 }
        : { opacity: 0 };
  return (
    <div className="relative h-64 overflow-hidden rounded-lg bg-ink" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={initial}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex h-full flex-col justify-center p-6"
        >
          <p className="text-xl font-semibold">{scene.text}</p>
          <p className="mt-3 text-sm text-muted">{scene.visual}</p>
          <p className="mt-4 text-xs uppercase tracking-wide text-accent">
            Transition: {scene.transition} · {scene.duration}s
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
