import { apiRequest } from '../../lib/api-client';
import { generateResponseSchema } from './types';
import type { SceneInput } from '../timeline/types';

export async function generateScenes(projectId: string, prompt: string): Promise<SceneInput[]> {
  const result = await apiRequest(`/projects/${projectId}/generate`, generateResponseSchema, {
    method: 'POST',
    body: { prompt },
  });
  return result.scenes;
}
