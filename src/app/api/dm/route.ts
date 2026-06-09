import { requireUserId } from "@/lib/auth";
import { CreateDmRequestSchema } from "@/lib/api/schemas/conversation";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { findOrCreateDm } from "@/lib/services/conversation.service";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = CreateDmRequestSchema.parse(await request.json());
    const { conversation, created, peer } = await findOrCreateDm(
      userId,
      body.targetUserId,
    );

    if (!peer) {
      throw new Error("Peer not found");
    }

    return apiSuccess(
      {
        id: conversation.id,
        type: conversation.type,
        peer: {
          id: peer.id,
          name: peer.name,
          email: peer.email,
          avatarUrl: peer.avatarUrl,
        },
      },
      created ? 201 : 200,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
