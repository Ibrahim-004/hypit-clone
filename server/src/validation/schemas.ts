import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(8).max(128),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export const projectCreateSchema = z.object({ title: z.string().trim().min(1).max(200) }).strict();
export const projectUpdateSchema = z.object({ title: z.string().trim().min(1).max(200) }).strict();
export const projectIdParamSchema = z.object({ id: z.string().min(1).max(100) }).strict();

export const sceneInputSchema = z
  .object({
    order: z.number().int().min(0).max(1000),
    text: z.string().trim().min(1).max(1000),
    duration: z.number().int().min(1).max(30),
    visual: z.string().trim().min(1).max(1000),
    transition: z.string().trim().min(1).max(100),
  })
  .strict();

export const scenesSaveSchema = z
  .object({
    scenes: z.array(sceneInputSchema).max(50),
  })
  .strict();

export const generateSchema = z
  .object({
    prompt: z.string().trim().min(1).max(2000),
  })
  .strict();

export const generatedSceneSchema = sceneInputSchema;
export const generatedScenesSchema = z.array(generatedSceneSchema).min(1).max(50);

export type SceneInput = z.infer<typeof sceneInputSchema>;
export type GeneratedScene = z.infer<typeof generatedSceneSchema>;
