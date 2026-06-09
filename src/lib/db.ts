import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl, loadRuntimeEnv } from "@/lib/runtime-env";

loadRuntimeEnv();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const databaseUrl = getDatabaseUrl();
  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
  }
  return new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
