import { Router } from 'express';
import { makeProjectController } from '../controllers/project.controller';
import type { Db } from '../services/db';
import type { AiClient } from '../services/ai.service';
import { validateBody, validateParams } from '../middleware/validate';
import {
  generateSchema,
  projectCreateSchema,
  projectIdParamSchema,
  projectUpdateSchema,
  scenesSaveSchema,
} from '../validation/schemas';
import { requireAuth } from '../middleware/auth';
import { generateLimiter } from '../middleware/rate-limit';
import { asyncHandler } from '../utils/async-handler';

export function projectRouter(db: Db, ai: AiClient): Router {
  const router = Router();
  const controller = makeProjectController(db, ai);
  router.use(requireAuth);
  router.get('/', asyncHandler(controller.list));
  router.post('/', validateBody(projectCreateSchema), asyncHandler(controller.create));
  router.get('/:id', validateParams(projectIdParamSchema), asyncHandler(controller.get));
  router.patch(
    '/:id',
    validateParams(projectIdParamSchema),
    validateBody(projectUpdateSchema),
    asyncHandler(controller.update),
  );
  router.delete('/:id', validateParams(projectIdParamSchema), asyncHandler(controller.remove));
  router.post(
    '/:id/generate',
    generateLimiter,
    validateParams(projectIdParamSchema),
    validateBody(generateSchema),
    asyncHandler(controller.generate),
  );
  router.put(
    '/:id/scenes',
    validateParams(projectIdParamSchema),
    validateBody(scenesSaveSchema),
    asyncHandler(controller.saveScenes),
  );
  return router;
}
