import { describe, expect, it, vi, afterEach } from 'vitest';
import { MultiProviderClient, OpenAiCompatibleClient } from '../src/services/ai.service';

const config = (model: string) => ({
  apiKey: 'test-key',
  baseUrl: 'https://example.invalid/v1',
  model,
  timeoutMs: 50,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// A stub fetch that honours the abort signal, the way the real fetch
// does when AbortSignal.timeout fires.
function hangingFetch(_url: unknown, init?: { signal?: AbortSignal }) {
  return new Promise((_resolve, reject) => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    init?.signal?.addEventListener('abort', () => reject(error), { once: true });
  });
}

describe('provider timeout', () => {
  it('fails fast with a 502 instead of hanging on a slow provider', async () => {
    vi.stubGlobal('fetch', hangingFetch);
    const client = new OpenAiCompatibleClient(config('slow-model'));
    const start = Date.now();
    await expect(client.generateRaw('hello')).rejects.toMatchObject({
      status: 502,
      code: 'AI_INVALID_OUTPUT',
    });
    expect(Date.now() - start).toBeLessThan(5000);
  });

  it('stops the rotation at the shared deadline instead of adding up timeouts', async () => {
    vi.stubGlobal('fetch', hangingFetch);
    const client = new MultiProviderClient([
      new OpenAiCompatibleClient(config('slow-one')),
      new OpenAiCompatibleClient(config('slow-two')),
      new OpenAiCompatibleClient(config('slow-three')),
    ]);
    const start = Date.now();
    // A 120 ms total budget: each provider is capped at 50 ms, so the
    // rotation must end well inside the 30 second function limit.
    await expect(client.generateRaw('hello', Date.now() + 120)).rejects.toMatchObject({
      status: 502,
    });
    expect(Date.now() - start).toBeLessThan(5000);
  });
});
