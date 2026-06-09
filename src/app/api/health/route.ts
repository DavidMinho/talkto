import { prisma } from "@/lib/db";
import { apiSuccess } from "@/lib/api/response";

const startedAt = Date.now();

function safeDbHint(error: unknown): string | undefined {
  if (!(error instanceof Error)) return undefined;
  const msg = error.message;
  if (msg.includes("query_engine") || msg.includes("libquery_engine")) {
    return "prisma-engine-mismatch";
  }
  if (msg.includes("Can't reach database server")) return "db-unreachable";
  if (msg.includes("Environment variable not found: DATABASE_URL")) {
    return "missing-database-url";
  }
  return msg.slice(0, 120);
}

export async function GET() {
  let db: "connected" | "disconnected" = "disconnected";
  let dbHint: string | undefined;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "connected";
  } catch (error) {
    dbHint = safeDbHint(error);
    // Keep 200 so platform health checks pass once the process is up.
  }

  return apiSuccess({
    status: db === "connected" ? "ok" : "degraded",
    db,
    ...(dbHint ? { dbHint } : {}),
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
}
