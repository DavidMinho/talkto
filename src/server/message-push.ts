import { prisma } from "@/lib/db";
import { formatLastMessagePreview, type MessageDto } from "@/lib/messages";
import { getIO } from "@/server/socket";

export async function pushNewMessage(
  conversationId: string,
  message: MessageDto,
) {
  const io = getIO();
  if (!io) return;

  const members = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  const messagePayload = { conversationId, message };
  const previewPayload = {
    conversationId,
    lastMessage: {
      content: formatLastMessagePreview(
        message.content,
        message.imageUrl,
        message.inviteToken,
      ),
      createdAt: message.createdAt,
    },
    senderId: message.user.id,
  };

  for (const { userId } of members) {
    io.to(`user:${userId}`).emit("message:new", messagePayload);
    io.to(`user:${userId}`).emit("conversation:updated", previewPayload);
  }
}

export async function pushGroupMemberCount(
  conversationId: string,
  memberCount: number,
) {
  const io = getIO();
  if (!io) return;

  const members = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  const payload = { conversationId, memberCount };
  for (const { userId } of members) {
    io.to(`user:${userId}`).emit("conversation:updated", payload);
  }
}
