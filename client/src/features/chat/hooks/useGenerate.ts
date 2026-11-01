import { useMutation } from '@tanstack/react-query';
import { generateScenes } from '../api';
import { useUiStore } from '../../../store/ui-store';

export function useGenerate(projectId: string) {
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: (prompt: string) => generateScenes(projectId, prompt),
    onError: (error: Error) => addToast(error.message, 'error'),
  });
}
