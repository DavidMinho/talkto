import { requireUserId } from "@/lib/auth";
import { UpdateProfileRequestSchema } from "@/lib/api/schemas/user";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { getUserProfile, updateUserProfile } from "@/lib/services/user.service";

export async function GET() {
  try {
    const userId = await requireUserId();
    const profile = await getUserProfile(userId);
    return apiSuccess(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    const body = UpdateProfileRequestSchema.parse(await request.json());
    const profile = await updateUserProfile(userId, body);
    return apiSuccess(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
