import { requireUserId } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { leaveGroupConversation } from "@/lib/services/conversation.service";
import { pushGroupMemberCount } from "@/server/message-push";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const result = await leaveGroupConversation(userId, id);

    if (result.memberCount > 0) {
      await pushGroupMemberCount(id, result.memberCount);
    }

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
