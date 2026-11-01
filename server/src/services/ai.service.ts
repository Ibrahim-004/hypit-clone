import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { ApiError } from '../utils/errors';
import { generatedScenesSchema, type GeneratedScene } from '../validation/schemas';

export interface AiClient {
  generateRaw: (prompt: string) => Promise<unknown>;
}

export class AnthropicAiClient implements AiClient {
  async generateRaw(prompt: string): Promise<unknown> {
    if (!env.ANTHROPIC_API_KEY) {
      throw new ApiError(503, 'AI_UNAVAILABLE', 'AI generation is not configured on this server');
    }
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 2048,
      system:
        'You are a video scene planner. Return ONLY a JSON array of scenes. Each scene has order (0-based integer), text (narration, 1-1000 chars), duration (integer seconds, 1-30), visual (visual description, 1-1000 chars), and transition (one of: fade, slide, zoom, cut). Do not include any other text.',
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text')
      throw new ApiError(502, 'AI_INVALID_OUTPUT', 'AI returned no usable text');
    const text = textBlock.text.trim();
    try {
      return JSON.parse(text) as unknown;
    } catch {
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1)) as unknown;
      throw new ApiError(502, 'AI_INVALID_OUTPUT', 'AI output was not valid JSON');
    }
  }
}

export async function generateScenes(ai: AiClient, prompt: string): Promise<GeneratedScene[]> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = await ai.generateRaw(prompt);
      const parsed = generatedScenesSchema.safeParse(raw);
      if (!parsed.success) throw new Error('Schema validation failed');
      return parsed.data;
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && error.code === 'AI_UNAVAILABLE') throw error;
    }
  }
  if (lastError instanceof ApiError) throw lastError;
  throw new ApiError(
    502,
    'AI_INVALID_OUTPUT',
    'AI did not return valid scenes after retrying once',
  );
}
