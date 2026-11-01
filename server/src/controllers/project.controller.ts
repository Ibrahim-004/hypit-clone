import type { Request, Response } from 'express';
import {
  createProject,
  deleteProject,
  getProjectWithScenes,
  listProjects,
  saveScenes,
  updateProjectTitle,
} from '../services/project.service';
import type { Db, SceneInputRecord } from '../services/db';
import { generateScenes, type AiClient } from '../services/ai.service';

function userId(req: Request): string {
  if (!req.userId) throw new Error('Authenticated user missing');
  return req.userId;
}

export function makeProjectController(db: Db, ai: AiClient) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      res.json({ projects: await listProjects(db, userId(req)) });
    },
    async create(req: Request, res: Response): Promise<void> {
      const project = await createProject(db, userId(req), req.body.title as string);
      res.status(201).json({ project });
    },
    async get(req: Request, res: Response): Promise<void> {
      const project = await getProjectWithScenes(db, req.params.id as string, userId(req));
      res.json({ project });
    },
    async update(req: Request, res: Response): Promise<void> {
      const project = await updateProjectTitle(
        db,
        req.params.id as string,
        userId(req),
        req.body.title as string,
      );
      res.json({ project });
    },
    async remove(req: Request, res: Response): Promise<void> {
      await deleteProject(db, req.params.id as string, userId(req));
      res.status(204).send();
    },
    async generate(req: Request, res: Response): Promise<void> {
      await getProjectWithScenes(db, req.params.id as string, userId(req));
      const scenes = await generateScenes(ai, req.body.prompt as string);
      res.json({ scenes });
    },
    async saveScenes(req: Request, res: Response): Promise<void> {
      const scenes = await saveScenes(
        db,
        req.params.id as string,
        userId(req),
        req.body.scenes as SceneInputRecord[],
      );
      res.json({ scenes });
    },
  };
}
