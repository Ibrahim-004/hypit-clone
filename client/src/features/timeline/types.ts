import { z } from 'zod';

export const sceneInputSchema = z.object({
  order: z.number().int().min(0).max(1000),
  text: z.string().trim().min(1).max(1000),
  duration: z.number().int().min(1).max(30),
  visual: z.string().trim().min(1).max(1000),
  transition: z.string().trim().min(1).max(100),
});

export const savedSceneSchema = sceneInputSchema.extend({
  id: z.string(),
  projectId: z.string(),
});

export type SceneInput = z.infer<typeof sceneInputSchema>;
export type SavedScene = z.infer<typeof savedSceneSchema>;

export interface ClientScene {
  id: string;
  order: number;
  text: string;
  duration: number;
  visual: string;
  transition: string;
}

export function toClientScenes(scenes: SavedScene[] | SceneInput[]): ClientScene[] {
  return scenes.map((scene, index) => ({
    id: 'id' in scene ? scene.id : `generated-${index}-${Math.random().toString(36).slice(2, 8)}`,
    order: scene.order,
    text: scene.text,
    duration: scene.duration,
    visual: scene.visual,
    transition: scene.transition,
  }));
}

export function toSceneInputs(scenes: ClientScene[]): SceneInput[] {
  return scenes.map((scene, index) => ({
    order: index,
    text: scene.text,
    duration: scene.duration,
    visual: scene.visual,
    transition: scene.transition,
  }));
}

export function scenesEqual(a: ClientScene[], b: ClientScene[]): boolean {
  return JSON.stringify(toSceneInputs(a)) === JSON.stringify(toSceneInputs(b));
}
