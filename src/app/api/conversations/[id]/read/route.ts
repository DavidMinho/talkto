import { requireUserId } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { markConversationRead } from "@/lib/services/conversation.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await markConversationRead(userId, id);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
