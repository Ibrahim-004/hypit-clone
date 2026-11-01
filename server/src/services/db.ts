export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}
export interface ProjectRecord {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface SceneRecord {
  id: string;
  projectId: string;
  order: number;
  text: string;
  duration: number;
  visual: string;
  transition: string;
}
export type SceneInputRecord = Omit<SceneRecord, 'id' | 'projectId'>;

export interface Db {
  user: {
    findByEmail: (email: string) => Promise<UserRecord | null>;
    create: (data: { email: string; passwordHash: string }) => Promise<UserRecord>;
  };
  project: {
    findByUser: (userId: string) => Promise<ProjectRecord[]>;
    findOwned: (id: string, userId: string) => Promise<ProjectRecord | null>;
    create: (userId: string, title: string) => Promise<ProjectRecord>;
    updateTitle: (id: string, title: string) => Promise<ProjectRecord>;
    delete: (id: string) => Promise<void>;
  };
  scene: {
    findByProject: (projectId: string) => Promise<SceneRecord[]>;
    replace: (projectId: string, scenes: SceneInputRecord[]) => Promise<SceneRecord[]>;
  };
}

export interface PrismaTransactionClient {
  scene: {
    deleteMany: (args: { where: { projectId: string } }) => Promise<unknown>;
    createMany: (args: { data: (SceneInputRecord & { projectId: string })[] }) => Promise<unknown>;
    findMany: (args: {
      where: { projectId: string };
      orderBy: { order: 'asc' };
    }) => Promise<SceneRecord[]>;
  };
}

export interface PrismaLikeClient {
  user: {
    findUnique: (args: { where: { email: string } }) => Promise<UserRecord | null>;
    create: (args: { data: { email: string; passwordHash: string } }) => Promise<UserRecord>;
  };
  project: {
    findMany: (args: {
      where: { userId: string };
      orderBy: { createdAt: 'desc' };
    }) => Promise<ProjectRecord[]>;
    findFirst: (args: { where: { id: string; userId: string } }) => Promise<ProjectRecord | null>;
    create: (args: { data: { userId: string; title: string } }) => Promise<ProjectRecord>;
    update: (args: { where: { id: string }; data: { title: string } }) => Promise<ProjectRecord>;
    delete: (args: { where: { id: string } }) => Promise<ProjectRecord>;
  };
  scene: {
    findMany: (args: {
      where: { projectId: string };
      orderBy: { order: 'asc' };
    }) => Promise<SceneRecord[]>;
  };
  $transaction: <T>(fn: (tx: PrismaTransactionClient) => Promise<T>) => Promise<T>;
}

export function createPrismaDb(prisma: PrismaLikeClient): Db {
  return {
    user: {
      findByEmail: async (email) => prisma.user.findUnique({ where: { email } }),
      create: async (data) => prisma.user.create({ data }),
    },
    project: {
      findByUser: async (userId) =>
        prisma.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      findOwned: async (id, userId) => prisma.project.findFirst({ where: { id, userId } }),
      create: async (userId, title) => prisma.project.create({ data: { userId, title } }),
      updateTitle: async (id, title) => prisma.project.update({ where: { id }, data: { title } }),
      delete: async (id) => {
        await prisma.project.delete({ where: { id } });
      },
    },
    scene: {
      findByProject: async (projectId) =>
        prisma.scene.findMany({ where: { projectId }, orderBy: { order: 'asc' } }),
      replace: async (projectId, scenes) =>
        prisma.$transaction(async (tx) => {
          await tx.scene.deleteMany({ where: { projectId } });
          await tx.scene.createMany({ data: scenes.map((s) => ({ ...s, projectId })) });
          return tx.scene.findMany({ where: { projectId }, orderBy: { order: 'asc' } });
        }),
    },
  };
}
