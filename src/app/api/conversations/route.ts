import { ConversationType } from "@prisma/client";
import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { CreateGroupRequestSchema } from "@/lib/api/schemas/conversation";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import {
  createGroup,
  listConversations,
} from "@/lib/services/conversation.service";

const ListQuerySchema = z.object({
  type: z.enum(["GROUP", "DM"]).optional(),
});

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const query = ListQuerySchema.parse({
      type: searchParams.get("type") ?? undefined,
    });

    const conversations = await listConversations(
      userId,
      query.type as ConversationType | undefined,
    );
    return apiSuccess(conversations);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = CreateGroupRequestSchema.parse(await request.json());
    const conversation = await createGroup(userId, body.name);

    return apiSuccess(
      {
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
      },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
