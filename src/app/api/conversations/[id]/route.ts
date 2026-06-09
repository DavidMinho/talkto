import { requireUserId } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { getConversationDetail } from "@/lib/services/conversation.service";
import { isOnline } from "@/server/presence";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const detail = await getConversationDetail(userId, id);

    const members = detail.members.map((m) => ({
      ...m,
      isOnline: isOnline(m.id),
    }));

    return apiSuccess({
      ...detail,
      members,
      peer: detail.peer
        ? { ...detail.peer, isOnline: isOnline(detail.peer.id) }
        : undefined,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
