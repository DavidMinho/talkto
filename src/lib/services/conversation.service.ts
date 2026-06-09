import { ConversationType, MemberRole } from "@prisma/client";
import { isAllowedCloudinaryUrl } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { ApiError, ApiErrorCodes } from "@/lib/api/errors";
import { formatLastMessagePreview, mapMessage } from "@/lib/messages";
import { isOnline } from "@/server/presence";

export async function assertMembership(userId: string, conversationId: string) {
  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  });

  if (!member) {
    throw new ApiError(
      ApiErrorCodes.FORBIDDEN,
      "You are not a member of this conversation",
      403,
    );
  }

  return member;
}

async function getUnreadCount(
  conversationId: string,
  lastReadAt: Date | null,
) {
  return prisma.message.count({
    where: {
      conversationId,
      ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
    },
  });
}

function mapUserSummary(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}

export async function listConversations(
  userId: string,
  type?: ConversationType,
) {
  const memberships = await prisma.conversationMember.findMany({
    where: {
      userId,
      ...(type ? { conversation: { type } } : {}),
    },
    include: {
      conversation: {
        include: {
          members: { include: { user: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { user: true },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const items = await Promise.all(
    memberships.map(async (membership) => {
      const conv = membership.conversation;
      const lastMsg = conv.messages[0];
      const unreadCount = await getUnreadCount(
        conv.id,
        membership.lastReadAt,
      );

      const base = {
        id: conv.id,
        type: conv.type,
        name: conv.name,
        unreadCount,
        lastMessage: lastMsg
          ? {
              content: formatLastMessagePreview(
                lastMsg.content,
                lastMsg.imageUrl,
                lastMsg.inviteToken,
              ),
              createdAt: lastMsg.createdAt.toISOString(),
            }
          : null,
        updatedAt: (lastMsg?.createdAt ?? conv.createdAt).toISOString(),
      };

      if (conv.type === ConversationType.DM) {
        const peer = conv.members.find((m) => m.userId !== userId)?.user;
        return {
          ...base,
          peer: peer
            ? { ...mapUserSummary(peer), isOnline: isOnline(peer.id) }
            : undefined,
        };
      }

      return {
        ...base,
        memberCount: conv.members.length,
      };
    }),
  );

  return items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function createGroup(userId: string, name: string) {
  return prisma.conversation.create({
    data: {
      type: ConversationType.GROUP,
      name,
      createdById: userId,
      members: {
        create: {
          userId,
          role: MemberRole.OWNER,
          lastReadAt: new Date(),
        },
      },
    },
  });
}

export async function findOrCreateDm(userId: string, targetUserId: string) {
  if (userId === targetUserId) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "Cannot create DM with yourself",
      400,
    );
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) {
    throw new ApiError(ApiErrorCodes.NOT_FOUND, "User not found", 404);
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      type: ConversationType.DM,
      AND: [
        { members: { some: { userId } } },
        { members: { some: { userId: targetUserId } } },
      ],
    },
    include: {
      members: { include: { user: true } },
    },
  });

  if (existing) {
    const peer = existing.members.find((m) => m.userId !== userId)?.user;
    return { conversation: existing, created: false, peer };
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: ConversationType.DM,
      createdById: userId,
      members: {
        create: [
          { userId, role: MemberRole.OWNER, lastReadAt: new Date() },
          { userId: targetUserId, role: MemberRole.MEMBER },
        ],
      },
    },
    include: {
      members: { include: { user: true } },
    },
  });

  return { conversation, created: true, peer: target };
}

export async function getConversationDetail(
  userId: string,
  conversationId: string,
) {
  await assertMembership(userId, conversationId);

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: { include: { user: true } },
    },
  });

  if (!conversation) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      "Conversation not found",
      404,
    );
  }

  const members = conversation.members.map((m) => ({
    ...mapUserSummary(m.user),
    role: m.role,
  }));

  if (conversation.type === ConversationType.DM) {
    const peer = conversation.members.find((m) => m.userId !== userId)?.user;
    return {
      id: conversation.id,
      type: conversation.type,
      name: conversation.name,
      members,
      peer: peer ? mapUserSummary(peer) : undefined,
    };
  }

  return {
    id: conversation.id,
    type: conversation.type,
    name: conversation.name,
    members,
  };
}

export async function leaveGroupConversation(
  userId: string,
  conversationId: string,
) {
  const member = await assertMembership(userId, conversationId);

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: true },
  });

  if (!conversation) {
    throw new ApiError(
      ApiErrorCodes.NOT_FOUND,
      "Conversation not found",
      404,
    );
  }

  if (conversation.type !== ConversationType.GROUP) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "Only group conversations can be left",
      400,
    );
  }

  await prisma.conversationMember.delete({
    where: { id: member.id },
  });

  const remaining = await prisma.conversationMember.count({
    where: { conversationId },
  });

  if (remaining === 0) {
    await prisma.conversation.delete({ where: { id: conversationId } });
  }

  return {
    conversationId,
    memberCount: remaining,
    redirectUrl: "/chats",
  };
}

export async function markConversationRead(
  userId: string,
  conversationId: string,
) {
  const member = await assertMembership(userId, conversationId);
  const lastReadAt = new Date();

  await prisma.conversationMember.update({
    where: { id: member.id },
    data: { lastReadAt },
  });

  return { lastReadAt: lastReadAt.toISOString() };
}

export async function getMessages(
  userId: string,
  conversationId: string,
  cursor?: string,
  limit = 50,
) {
  await assertMembership(userId, conversationId);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = messages.length > limit;
  const slice = hasMore ? messages.slice(0, limit) : messages;

  return {
    messages: slice.reverse().map(mapMessage),
    nextCursor: hasMore ? slice[0]?.id ?? null : null,
  };
}

export async function createMessage(
  userId: string,
  conversationId: string,
  content: string,
  imageUrl?: string | null,
  inviteToken?: string | null,
) {
  await assertMembership(userId, conversationId);

  const sanitized = content.trim();
  const normalizedImageUrl = imageUrl?.trim() || null;
  const normalizedInviteToken = inviteToken?.trim() || null;

  if (!sanitized && !normalizedImageUrl && !normalizedInviteToken) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "Message must include text, an image, or an invite",
      400,
    );
  }

  if (
    normalizedImageUrl &&
    !isAllowedCloudinaryUrl(normalizedImageUrl)
  ) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "Invalid image URL",
      400,
    );
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      userId,
      content: sanitized,
      imageUrl: normalizedImageUrl,
      inviteToken: normalizedInviteToken,
    },
    include: { user: true },
  });

  return mapMessage(message);
}
