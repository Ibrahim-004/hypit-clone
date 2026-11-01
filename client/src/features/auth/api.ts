import { z } from 'zod';
import { apiRequest } from '../../lib/api-client';
import { setAccessToken, clearAccessToken } from '../../lib/token-store';
import { authResponseSchema, type LoginFormValues, type RegisterFormValues } from './types';

export async function login(values: LoginFormValues) {
  const result = await apiRequest('/auth/login', authResponseSchema, {
    method: 'POST',
    body: values,
    allowRefresh: false,
  });
  setAccessToken(result.accessToken);
  return result;
}
export async function register(values: RegisterFormValues) {
  const result = await apiRequest('/auth/register', authResponseSchema, {
    method: 'POST',
    body: values,
    allowRefresh: false,
  });
  setAccessToken(result.accessToken);
  return result;
}
export async function logout() {
  try {
    await apiRequest('/auth/logout', z.undefined(), { method: 'POST' });
  } finally {
    clearAccessToken();
  }
}
