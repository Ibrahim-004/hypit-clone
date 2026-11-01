import { z } from 'zod';
import { sceneInputSchema } from '../timeline/types';

export const generateResponseSchema = z.object({ scenes: z.array(sceneInputSchema) });
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
