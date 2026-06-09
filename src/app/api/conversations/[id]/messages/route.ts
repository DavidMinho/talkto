import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { ApiError, ApiErrorCodes } from "@/lib/api/errors";
import { rateLimit } from "@/lib/api/rate-limit";
import { sanitizeMessage } from "@/lib/api/sanitize";
import { SendMessageRequestSchema } from "@/lib/api/schemas/conversation";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import {
  createMessage,
  getMessages,
} from "@/lib/services/conversation.service";
import { pushNewMessage } from "@/server/message-push";

type Params = { params: Promise<{ id: string }> };

const QuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const result = await getMessages(
      userId,
      id,
      query.cursor,
      query.limit,
    );
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const limit = rateLimit(`msg:${userId}`, 30, 60 * 1000);
    if (!limit.allowed) {
      throw new ApiError(
        ApiErrorCodes.RATE_LIMITED,
        "Too many messages sent",
        429,
      );
    }

    const body = SendMessageRequestSchema.parse(await request.json());
    const content = sanitizeMessage(body.content ?? "");

    const message = await createMessage(userId, id, content, body.imageUrl);

    await pushNewMessage(id, message);

    return apiSuccess(message, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
