import { Router } from 'express';
import { makeAuthController } from '../controllers/auth.controller';
import type { Db } from '../services/db';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validation/schemas';
import { authLimiter } from '../middleware/rate-limit';
import { asyncHandler } from '../utils/async-handler';

export function authRouter(db: Db): Router {
  const router = Router();
  const controller = makeAuthController(db);
  router.post(
    '/register',
    authLimiter,
    validateBody(registerSchema),
    asyncHandler(controller.register),
  );
  router.post('/login', authLimiter, validateBody(loginSchema), asyncHandler(controller.login));
  router.post('/refresh', asyncHandler(controller.refresh));
  router.post('/logout', asyncHandler(controller.logout));
  return router;
}
