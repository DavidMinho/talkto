import { prisma } from "@/lib/db";
import { ApiErrorCodes } from "@/lib/api/errors";
import { apiError, apiSuccess } from "@/lib/api/response";

const startedAt = Date.now();

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return apiSuccess({
      status: "ok",
      db: "connected",
      uptime: Math.floor((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return apiError(
      ApiErrorCodes.DB_UNAVAILABLE,
      "Database unreachable",
      503,
    );
  }
}
