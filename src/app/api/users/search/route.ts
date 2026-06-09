import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { searchUsers } from "@/lib/services/user.service";

const QuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse({
      q: searchParams.get("q"),
      limit: searchParams.get("limit") ?? undefined,
    });

    const users = await searchUsers(userId, query.q, query.limit);
    return apiSuccess(users);
  } catch (error) {
    return handleApiError(error);
  }
}
