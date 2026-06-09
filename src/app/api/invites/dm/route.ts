import { InviteType } from "@prisma/client";
import { requireUserId } from "@/lib/auth";
import { CreateInviteRequestSchema } from "@/lib/api/schemas/invite";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { createInvite } from "@/lib/services/invite.service";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = CreateInviteRequestSchema.parse({
      ...(await request.json()),
      inviteType: "DM",
    });

    const result = await createInvite(
      userId,
      null,
      InviteType.DM,
      body.expiresInDays,
      body.maxUses ?? 1,
    );

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
