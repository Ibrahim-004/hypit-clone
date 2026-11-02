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

const SCENE_SYSTEM_PROMPT =
  'You are a video scene planner. Return ONLY a JSON array of scenes. Each scene has order (0-based integer), text (narration, 1-1000 chars), duration (integer seconds, 1-30), visual (visual description, 1-1000 chars), and transition (one of: fade, slide, zoom, cut). Do not include any other text.';

function parseJsonArray(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf('[');
    const end = trimmed.lastIndexOf(']');
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    throw new ApiError(502, 'AI_INVALID_OUTPUT', 'AI output was not valid JSON');
  }
}

/**
 * Generic OpenAI compatible chat completions client, used for free
 * providers such as OpenRouter (free models, including DeepSeek and Qwen)
 * or Groq. Configured only through AI_API_KEY, AI_API_BASE_URL and
 * AI_MODEL, so no provider specific SDK is needed. The base URL must
 * point at the provider chat completions root, for example
 * https://openrouter.ai/api/v1 or https://api.groq.com/openai/v1
 */
export class OpenAiCompatibleClient implements AiClient {
  async generateRaw(prompt: string): Promise<unknown> {
    if (!env.AI_API_KEY || !env.AI_MODEL) {
      throw new ApiError(503, 'AI_UNAVAILABLE', 'AI generation is not configured on this server');
    }
    const baseUrl = (env.AI_API_BASE_URL ?? 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
        'HTTP-Referer': 'https://hypit-clone.vercel.app',
        'X-Title': 'Hypit-style',
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: SCENE_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403) {
        throw new ApiError(503, 'AI_UNAVAILABLE', 'AI provider rejected the configured key');
      }
      if (response.status === 429) {
        throw new ApiError(502, 'AI_INVALID_OUTPUT', `AI provider rate limit: ${detail.slice(0, 200)}`);
      }
      throw new ApiError(502, 'AI_INVALID_OUTPUT', `AI provider error ${response.status}`);
    }
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new ApiError(502, 'AI_INVALID_OUTPUT', 'AI returned no usable text');
    return parseJsonArray(content);
  }
}

/** Prefer the free OpenAI compatible provider when it is configured, otherwise Anthropic. */
export function createAiClient(): AiClient {
  if (env.AI_API_KEY) return new OpenAiCompatibleClient();
  return new AnthropicAiClient();
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
