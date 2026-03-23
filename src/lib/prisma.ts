import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  // Use DATABASE_URL which Neon sets automatically
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('PG') || k.includes('DATABASE') || k.includes('POSTGRES')));
    throw new Error("DATABASE_URL environment variable is not set");
  }
  console.log("Connecting to database...");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
