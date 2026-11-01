import { useEffect } from 'react';
import type { ClientScene } from '../../timeline/types';
import { usePreviewPlayback } from '../hooks/usePreviewPlayback';
import { SceneStage } from './SceneStage';
import { PlaybackControls } from './PlaybackControls';
import { Scrubber } from './Scrubber';
import { EmptyState } from '../../../components/ui/EmptyState';

export function PreviewPlayer({ scenes }: { scenes: ClientScene[] }) {
  const { playing, elapsedSeconds, totalSeconds, sceneIndex, play, pause, seek, scrub } =
    usePreviewPlayback(scenes);
  const currentScene = scenes[sceneIndex];

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (event.code === 'Space') {
        event.preventDefault();
        if (playing) pause();
        else play();
      }
      if (event.key === 'ArrowRight') scrub(5);
      if (event.key === 'ArrowLeft') scrub(-5);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playing, play, pause, scrub]);

  if (scenes.length === 0)
    return (
      <EmptyState title="Nothing to preview yet">
        Add or generate scenes to see them animated here.
      </EmptyState>
    );

  return (
    <section
      aria-label="Preview player"
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4"
    >
      <h2 className="text-lg font-semibold">Preview</h2>
      <SceneStage scene={currentScene} />
      <PlaybackControls playing={playing} onPlay={play} onPause={pause} />
      <Scrubber value={elapsedSeconds} max={totalSeconds} onSeek={seek} />
      <p className="text-xs text-muted">
        Keyboard: Space plays or pauses, arrow keys scrub 5 seconds.
      </p>
    </section>
  );
}
