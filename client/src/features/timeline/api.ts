import { z } from 'zod';
import { apiRequest } from '../../lib/api-client';
import { savedSceneSchema, type SceneInput } from './types';

const saveResponseSchema = z.object({ scenes: z.array(savedSceneSchema) });

export async function saveScenes(projectId: string, scenes: SceneInput[]) {
  const result = await apiRequest(`/projects/${projectId}/scenes`, saveResponseSchema, {
    method: 'PUT',
    body: { scenes },
  });
  return result.scenes;
}
