import { prisma } from "@/lib/db";
import { apiSuccess } from "@/lib/api/response";

const startedAt = Date.now();

export async function GET() {
  let db: "connected" | "disconnected" = "disconnected";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "connected";
  } catch {
    // Keep 200 so Render health checks pass once the process is up.
  }

  return apiSuccess({
    status: db === "connected" ? "ok" : "degraded",
    db,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
}
