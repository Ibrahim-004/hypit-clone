import { z } from 'zod';
import { savedSceneSchema } from '../timeline/types';

export const projectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  scenes: z.array(savedSceneSchema).optional(),
});

export const projectListSchema = z.object({ projects: z.array(projectSchema) });
export const projectDetailSchema = z.object({ project: projectSchema });
export const projectCreateSchema = z.object({ project: projectSchema });

export type Project = z.infer<typeof projectSchema>;
