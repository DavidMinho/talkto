import { requireAdmin } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { getAdminStats } from "@/lib/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getAdminStats();
    return apiSuccess(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
