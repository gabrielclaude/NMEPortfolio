import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const datasourceUrl = process.env.DATABASE_URL;
  if (!datasourceUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  // Prisma Postgres (db.prisma.io) - use datasourceUrl
  return new PrismaClient({
    datasourceUrl
  } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
