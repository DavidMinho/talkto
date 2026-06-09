import { z } from "zod";
import { UserRoles } from "@/lib/roles";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { deleteUser, updateUser } from "@/lib/services/admin.service";

type Params = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum([UserRoles.USER, UserRoles.ADMIN]).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actorId = await requireAdmin();
    const { id } = await params;
    const body = UpdateSchema.parse(await request.json());
    const user = await updateUser(id, body, actorId);
    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const actorId = await requireAdmin();
    const { id } = await params;
    const result = await deleteUser(id, actorId);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
