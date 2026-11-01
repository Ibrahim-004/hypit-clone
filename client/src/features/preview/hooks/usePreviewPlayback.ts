import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ClientScene } from '../../timeline/types';

export function usePreviewPlayback(scenes: ClientScene[]) {
  const [playing, setPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const totalSeconds = useMemo(
    () => scenes.reduce((sum, scene) => sum + scene.duration, 0),
    [scenes],
  );
  const timerRef = useRef<number | null>(null);

  const sceneIndex = useMemo(() => {
    let remaining = elapsedSeconds;
    for (let i = 0; i < scenes.length; i += 1) {
      const scene = scenes[i];
      if (!scene) return 0;
      if (remaining < scene.duration) return i;
      remaining -= scene.duration;
    }
    return Math.max(0, scenes.length - 1);
  }, [elapsedSeconds, scenes]);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 0.25;
        if (next >= totalSeconds) {
          setPlaying(false);
          return totalSeconds;
        }
        return next;
      });
    }, 250);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [playing, totalSeconds]);

  const play = useCallback(() => {
    if (elapsedSeconds >= totalSeconds && totalSeconds > 0) setElapsedSeconds(0);
    setPlaying(true);
  }, [elapsedSeconds, totalSeconds]);

  const pause = useCallback(() => setPlaying(false), []);

  const seek = useCallback(
    (seconds: number) => {
      setElapsedSeconds(Math.max(0, Math.min(totalSeconds, seconds)));
    },
    [totalSeconds],
  );

  const scrub = useCallback(
    (deltaSeconds: number) => {
      setElapsedSeconds((prev) => Math.max(0, Math.min(totalSeconds, prev + deltaSeconds)));
    },
    [totalSeconds],
  );

  return { playing, elapsedSeconds, totalSeconds, sceneIndex, play, pause, seek, scrub };
}
