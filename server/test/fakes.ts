import type { Db, ProjectRecord, SceneRecord, UserRecord } from '../src/services/db';

export function createFakeDb(): Db {
  const users: UserRecord[] = [];
  const projects: ProjectRecord[] = [];
  const scenes: SceneRecord[] = [];
  let counter = 0;
  const nextId = () => {
    counter += 1;
    return `id-${counter}`;
  };
  return {
    user: {
      findByEmail: async (email) => users.find((u) => u.email === email) ?? null,
      create: async (data) => {
        const user: UserRecord = {
          id: nextId(),
          email: data.email,
          passwordHash: data.passwordHash,
          createdAt: new Date(),
        };
        users.push(user);
        return user;
      },
    },
    project: {
      findByUser: async (userId) =>
        projects
          .filter((p) => p.userId === userId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      findOwned: async (id, userId) =>
        projects.find((p) => p.id === id && p.userId === userId) ?? null,
      create: async (userId, title) => {
        const project: ProjectRecord = {
          id: nextId(),
          userId,
          title,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        projects.push(project);
        return project;
      },
      updateTitle: async (id, title) => {
        const project = projects.find((p) => p.id === id);
        if (!project) throw new Error('Project not found in fake db');
        project.title = title;
        return project;
      },
      delete: async (id) => {
        const index = projects.findIndex((p) => p.id === id);
        if (index >= 0) projects.splice(index, 1);
        for (let i = scenes.length - 1; i >= 0; i -= 1) {
          if (scenes[i]?.projectId === id) scenes.splice(i, 1);
        }
      },
    },
    scene: {
      findByProject: async (projectId) =>
        scenes.filter((s) => s.projectId === projectId).sort((a, b) => a.order - b.order),
      replace: async (projectId, next) => {
        for (let i = scenes.length - 1; i >= 0; i -= 1) {
          if (scenes[i]?.projectId === projectId) scenes.splice(i, 1);
        }
        const created: SceneRecord[] = next.map((s) => ({ ...s, id: nextId(), projectId }));
        scenes.push(...created);
        return created.sort((a, b) => a.order - b.order);
      },
    },
  };
}

export function fakeAi(scenes: unknown) {
  return { generateRaw: async () => scenes };
}
