import { handleApiError, apiSuccess } from "@/lib/api/response";
import { getInviteDetail } from "@/lib/services/invite.service";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { token } = await params;
    const detail = await getInviteDetail(token);
    return apiSuccess(detail);
  } catch (error) {
    return handleApiError(error);
  }
}
