import { ConversationType, InviteType, MemberRole } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { ApiError, ApiErrorCodes } from "@/lib/api/errors";
import {
  assertMembership,
  createMessage,
  findOrCreateDm,
} from "./conversation.service";
import { pushGroupMemberCount, pushNewMessage } from "@/server/message-push";

function getBaseUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3010";
}

export async function createInvite(
  userId: string,
  conversationId: string | null,
  inviteType: InviteType,
  expiresInDays: number,
  maxUses?: number | null,
  targetUserId?: string | null,
) {
  if (inviteType === InviteType.GROUP) {
    if (!conversationId) {
      throw new ApiError(
        ApiErrorCodes.VALIDATION_ERROR,
        "conversationId is required for GROUP invites",
        400,
      );
    }
    await assertMembership(userId, conversationId);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const token = nanoid(21);
  const invite = await prisma.invite.create({
    data: {
      conversationId,
      inviteType,
      token,
      createdById: userId,
      targetUserId: targetUserId ?? null,
      expiresAt,
      maxUses: maxUses ?? null,
    },
  });

  const path =
    inviteType === InviteType.DM
      ? `/invite/dm/${token}`
      : `/invite/${token}`;

  return {
    token: invite.token,
    url: `${getBaseUrl()}${path}`,
    expiresAt: invite.expiresAt.toISOString(),
  };
}

export async function sendGroupInviteToUser(
  inviterId: string,
  conversationId: string,
  targetUserId: string,
) {
  if (inviterId === targetUserId) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "Cannot invite yourself",
      400,
    );
  }

  await assertMembership(inviterId, conversationId);

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: true },
  });

  if (!conversation || conversation.type !== ConversationType.GROUP) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "Only group conversations can send user invites",
      400,
    );
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) {
    throw new ApiError(ApiErrorCodes.NOT_FOUND, "User not found", 404);
  }

  const alreadyMember = conversation.members.some(
    (m) => m.userId === targetUserId,
  );
  if (alreadyMember) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "User is already a member of this group",
      400,
    );
  }

  const invite = await createInvite(
    inviterId,
    conversationId,
    InviteType.GROUP,
    7,
    1,
    targetUserId,
  );

  const { conversation: dm } = await findOrCreateDm(inviterId, targetUserId);
  const groupName = conversation.name ?? "กลุ่ม";
  const message = await createMessage(
    inviterId,
    dm.id,
    `เชิญคุณเข้าร่วมห้อง "${groupName}"`,
    null,
    invite.token,
  );

  await pushNewMessage(dm.id, message);

  return {
    inviteToken: invite.token,
    dmConversationId: dm.id,
    targetUser: { id: target.id, name: target.name },
  };
}

export async function getInviteDetail(token: string) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      conversation: {
        include: { members: true },
      },
      createdBy: true,
    },
  });

  if (!invite) {
    throw new ApiError(ApiErrorCodes.NOT_FOUND, "Invite not found", 404);
  }

  const isExpired = invite.expiresAt < new Date();
  const isMaxed =
    invite.maxUses !== null && invite.usedCount >= invite.maxUses;
  const isValid = !isExpired && !isMaxed;

  return {
    inviteType: invite.inviteType,
    conversation: invite.conversation
      ? {
          id: invite.conversation.id,
          name: invite.conversation.name,
          memberCount: invite.conversation.members.length,
        }
      : null,
    inviter: { name: invite.createdBy.name },
    expiresAt: invite.expiresAt.toISOString(),
    isValid,
  };
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { conversation: true },
  });

  if (!invite) {
    throw new ApiError(ApiErrorCodes.NOT_FOUND, "Invite not found", 404);
  }

  const isExpired = invite.expiresAt < new Date();
  const isMaxed =
    invite.maxUses !== null && invite.usedCount >= invite.maxUses;

  if (isExpired || isMaxed) {
    throw new ApiError(
      ApiErrorCodes.INVITE_INVALID,
      "Invite is expired or fully used",
      422,
    );
  }

  if (invite.targetUserId && invite.targetUserId !== userId) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      "This invite is for another user",
      403,
    );
  }

  if (invite.inviteType === InviteType.DM) {
    const { conversation } = await findOrCreateDm(userId, invite.createdById);

    await prisma.invite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });

    return {
      conversationId: conversation.id,
      redirectUrl: `/chats/${conversation.id}`,
    };
  }

  if (!invite.conversationId) {
    throw new ApiError(
      ApiErrorCodes.INVITE_INVALID,
      "Invalid group invite",
      422,
    );
  }

  const existing = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId: invite.conversationId,
        userId,
      },
    },
  });

  if (!existing) {
    await prisma.conversationMember.create({
      data: {
        conversationId: invite.conversationId,
        userId,
        role: MemberRole.MEMBER,
        lastReadAt: new Date(),
      },
    });
  }

  await prisma.invite.update({
    where: { id: invite.id },
    data: { usedCount: { increment: 1 } },
  });

  const memberCount = await prisma.conversationMember.count({
    where: { conversationId: invite.conversationId },
  });
  await pushGroupMemberCount(invite.conversationId, memberCount);

  return {
    conversationId: invite.conversationId,
    redirectUrl: `/chats/${invite.conversationId}`,
  };
}
