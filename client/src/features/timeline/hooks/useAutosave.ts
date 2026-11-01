import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { saveScenes } from '../api';
import { scenesEqual, toSceneInputs, type ClientScene } from '../types';
import type { SaveStatusValue } from '../../../components/SaveStatus';

interface AutosaveArgs {
  projectId: string;
  scenes: ClientScene[];
  savedScenes: ClientScene[];
  onSaved: (scenes: ClientScene[]) => void;
  onRollback: (scenes: ClientScene[]) => void;
}

export function useAutosave({ projectId, scenes, savedScenes, onSaved, onRollback }: AutosaveArgs) {
  const [status, setStatus] = useState<SaveStatusValue>('idle');
  const savedRef = useRef(savedScenes);
  savedRef.current = savedScenes;
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;

  const mutation = useMutation({
    mutationFn: (next: ClientScene[]) => saveScenes(projectId, toSceneInputs(next)),
    onSuccess: () => {
      onSaved(scenesRef.current);
      setStatus('saved');
    },
    onError: () => {
      onRollback(savedRef.current);
      setStatus('failed');
    },
  });

  useEffect(() => {
    if (scenesEqual(scenes, savedScenes)) return;
    setStatus('saving');
    const timer = window.setTimeout(() => {
      mutation.mutate(scenes);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [scenes, savedScenes, projectId]);

  return { status };
}
