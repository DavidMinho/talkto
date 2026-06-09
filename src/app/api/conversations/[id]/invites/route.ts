import { InviteType } from "@prisma/client";
import { requireUserId } from "@/lib/auth";
import { CreateInviteRequestSchema } from "@/lib/api/schemas/invite";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { createInvite } from "@/lib/services/invite.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = CreateInviteRequestSchema.parse(await request.json());

    const result = await createInvite(
      userId,
      body.inviteType === "GROUP" ? id : null,
      body.inviteType as InviteType,
      body.expiresInDays,
      body.maxUses,
    );

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
