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
export interface OpenAiProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export class OpenAiCompatibleClient implements AiClient {
  private readonly config: OpenAiProviderConfig;

  constructor(config?: OpenAiProviderConfig) {
    this.config = config ?? {
      apiKey: env.AI_API_KEY ?? '',
      baseUrl: env.AI_API_BASE_URL ?? 'https://openrouter.ai/api/v1',
      model: env.AI_MODEL ?? '',
    };
  }

  async generateRaw(prompt: string): Promise<unknown> {
    if (!this.config.apiKey || !this.config.model) {
      throw new ApiError(503, 'AI_UNAVAILABLE', 'AI generation is not configured on this server');
    }
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': 'https://hypit-clone.vercel.app',
        'X-Title': 'Hypit-style',
      },
      body: JSON.stringify({
        model: this.config.model,
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

/**
 * Tries each configured provider in order. When one is rate limited,
 * rejects the key, or returns unusable output, the next provider is
 * tried immediately, so a free tier limit on one provider does not
 * block generation while another free provider still has quota.
 */
export class MultiProviderClient implements AiClient {
  private readonly providers: AiClient[];

  constructor(providers: AiClient[]) {
    this.providers = providers;
  }

  async generateRaw(prompt: string): Promise<unknown> {
    let lastError: unknown = null;
    for (const provider of this.providers) {
      try {
        return await provider.generateRaw(prompt);
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) throw lastError;
    throw new ApiError(503, 'AI_UNAVAILABLE', 'AI generation is not configured on this server');
  }
}

/** Prefer the free OpenAI compatible providers when configured, otherwise Anthropic. */
export function createAiClient(): AiClient {
  const providers: AiClient[] = [];
  const groups: Array<{ key?: string; baseUrl?: string; model?: string }> = [
    { key: env.AI_API_KEY, baseUrl: env.AI_API_BASE_URL, model: env.AI_MODEL },
    { key: env.AI2_API_KEY, baseUrl: env.AI2_API_BASE_URL, model: env.AI2_MODEL },
    { key: env.AI3_API_KEY, baseUrl: env.AI3_API_BASE_URL, model: env.AI3_MODEL },
    { key: env.AI4_API_KEY, baseUrl: env.AI4_API_BASE_URL, model: env.AI4_MODEL },
  ];
  for (const group of groups) {
    if (group.key && group.model) {
      providers.push(
        new OpenAiCompatibleClient({
          apiKey: group.key,
          baseUrl: group.baseUrl ?? 'https://openrouter.ai/api/v1',
          model: group.model,
        }),
      );
    }
  }
  if (providers.length > 0) return new MultiProviderClient(providers);
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
