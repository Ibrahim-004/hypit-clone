import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CLIENT_URL: z.string().min(1).default('http://localhost:5173'),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-3-5-sonnet-20241022'),
  AI_API_KEY: z.string().optional(),
  AI_API_BASE_URL: z.string().optional(),
  AI_MODEL: z.string().optional(),
  AI2_API_KEY: z.string().optional(),
  AI2_API_BASE_URL: z.string().optional(),
  AI2_MODEL: z.string().optional(),
  AI3_API_KEY: z.string().optional(),
  AI3_API_BASE_URL: z.string().optional(),
  AI3_MODEL: z.string().optional(),
  AI4_API_KEY: z.string().optional(),
  AI4_API_BASE_URL: z.string().optional(),
  AI4_MODEL: z.string().optional(),
  AI5_API_KEY: z.string().optional(),
  AI5_API_BASE_URL: z.string().optional(),
  AI5_MODEL: z.string().optional(),
  AI_PROVIDER_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  AI_GENERATION_TIMEOUT_MS: z.coerce.number().int().positive().default(25000),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    `Invalid environment: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
  );
}
export const env = parsed.data;
