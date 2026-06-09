import { requireUserId } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { acceptInvite } from "@/lib/services/invite.service";

type Params = { params: Promise<{ token: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { token } = await params;
    const result = await acceptInvite(token, userId);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
