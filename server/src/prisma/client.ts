import { createPrismaDb, type Db, type PrismaLikeClient } from '../services/db';

// The generated Prisma client is produced by `npm run db:generate` (see README).
// It is loaded lazily here so unit tests, which always inject a fake Db, and
// typechecking do not require the generated client to already exist.
export function getDefaultDb(): Db {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('@prisma/client') as unknown as { PrismaClient: new () => PrismaLikeClient };
  const prisma = new mod.PrismaClient();
  return createPrismaDb(prisma);
}
