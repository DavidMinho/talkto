import { z } from "zod";
import { requireUserId } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { sendGroupInviteToUser } from "@/lib/services/invite.service";

type Params = { params: Promise<{ id: string }> };

const BodySchema = z.object({
  targetUserId: z.string().min(1),
});

export async function POST(request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = BodySchema.parse(await request.json());

    const result = await sendGroupInviteToUser(
      userId,
      id,
      body.targetUserId,
    );

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
