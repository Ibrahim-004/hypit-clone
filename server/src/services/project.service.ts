import { notFound } from '../utils/errors';
import type { Db, SceneInputRecord } from './db';

export async function listProjects(db: Db, userId: string) {
  return db.project.findByUser(userId);
}
export async function createProject(db: Db, userId: string, title: string) {
  return db.project.create(userId, title);
}
export async function getProjectWithScenes(db: Db, id: string, userId: string) {
  const project = await db.project.findOwned(id, userId);
  if (!project) throw notFound('Project not found');
  const scenes = await db.scene.findByProject(id);
  return { ...project, scenes };
}
export async function updateProjectTitle(db: Db, id: string, userId: string, title: string) {
  const project = await db.project.findOwned(id, userId);
  if (!project) throw notFound('Project not found');
  return db.project.updateTitle(id, title);
}
export async function deleteProject(db: Db, id: string, userId: string) {
  const project = await db.project.findOwned(id, userId);
  if (!project) throw notFound('Project not found');
  await db.project.delete(id);
}
export async function saveScenes(db: Db, id: string, userId: string, scenes: SceneInputRecord[]) {
  const project = await db.project.findOwned(id, userId);
  if (!project) throw notFound('Project not found');
  const ordered = scenes.map((s, index) => ({ ...s, order: index }));
  return db.scene.replace(id, ordered);
}
