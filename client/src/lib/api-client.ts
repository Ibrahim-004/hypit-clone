import type { z } from 'zod';
import { ApiError } from './errors';
import { clearAccessToken, getAccessToken, setAccessToken } from './token-store';

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api/v1';

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { accessToken?: unknown };
    if (typeof data.accessToken !== 'string') return false;
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  allowRefresh?: boolean;
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, allowRefresh = true } = options;
  const doFetch = async (): Promise<Response> =>
    fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let response = await doFetch();
  if (response.status === 401 && allowRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await doFetch();
    } else {
      clearAccessToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new ApiError(401, 'UNAUTHORIZED', 'Your session expired. Please log in again.');
    }
  }

  if (response.status === 204) return undefined as unknown as T;
  const text = await response.text();
  const parsedBody: unknown = text ? (JSON.parse(text) as unknown) : null;
  if (!response.ok) {
    const errorBody = parsedBody as { error?: { code?: unknown; message?: unknown } } | null;
    const code =
      typeof errorBody?.error?.code === 'string' ? errorBody.error.code : 'REQUEST_FAILED';
    const message =
      typeof errorBody?.error?.message === 'string'
        ? errorBody.error.message
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, code, message);
  }
  const validated = schema.safeParse(parsedBody);
  if (!validated.success)
    throw new ApiError(500, 'INVALID_RESPONSE', 'Server returned an unexpected response');
  return validated.data;
}
