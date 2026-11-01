import { z } from 'zod';
import { apiRequest } from '../../lib/api-client';
import { projectCreateSchema, projectDetailSchema, projectListSchema } from './types';

export async function listProjects() {
  return (await apiRequest('/projects', projectListSchema)).projects;
}
export async function createProject(title: string) {
  return (await apiRequest('/projects', projectCreateSchema, { method: 'POST', body: { title } }))
    .project;
}
export async function getProject(id: string) {
  return (await apiRequest(`/projects/${id}`, projectDetailSchema)).project;
}
export async function updateProjectTitle(id: string, title: string) {
  return (
    await apiRequest(`/projects/${id}`, projectDetailSchema, { method: 'PATCH', body: { title } })
  ).project;
}
export async function deleteProject(id: string) {
  await apiRequest(`/projects/${id}`, z.undefined(), { method: 'DELETE' });
}
