import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { listUsers } from "@/lib/services/admin.service";

const QuerySchema = z.object({
  q: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse({
      q: searchParams.get("q") ?? undefined,
    });
    const users = await listUsers(query.q);
    return apiSuccess(users);
  } catch (error) {
    return handleApiError(error);
  }
}
