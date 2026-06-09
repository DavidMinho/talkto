import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { getAuthSecret } from "@/lib/runtime-env";
import { sanitizeMessage } from "@/lib/api/sanitize";
import { createMessage } from "@/lib/services/conversation.service";
import { pushNewMessage } from "@/server/message-push";
import {
  getOnlineUserIds,
  isOnline,
  markOffline,
  markOnline,
} from "./presence";

let io: Server | null = null;

export function getIO() {
  return io;
}

export function initSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL ?? "http://localhost:3010",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = await getToken({
        req: (socket.request ?? {
          headers: socket.handshake.headers,
        }) as never,
        secret: getAuthSecret(),
      });

      if (!token?.id) {
        return next(new Error("Unauthorized"));
      }

      socket.data.userId = token.id as string;
      socket.data.userName = (token.name as string) ?? "User";
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    const wasOffline = !isOnline(userId);
    markOnline(userId, socket.id);
    socket.join(`user:${userId}`);

    if (wasOffline) {
      io?.emit("presence:update", { userId, status: "online" });
    }

    socket.on("presence:subscribe", async ({ userIds }: { userIds: string[] }) => {
      const online = getOnlineUserIds(userIds);
      socket.emit("presence:sync", { onlineUserIds: online });
    });

    socket.on(
      "conversation:join",
      async ({ conversationId }: { conversationId: string }) => {
        const member = await prisma.conversationMember.findUnique({
          where: {
            conversationId_userId: { conversationId, userId },
          },
        });
        if (!member) return;
        socket.join(`conversation:${conversationId}`);
        socket.emit("conversation:joined", { conversationId });
      },
    );

    socket.on(
      "conversation:leave",
      ({ conversationId }: { conversationId: string }) => {
        socket.leave(`conversation:${conversationId}`);
      },
    );

    socket.on(
      "typing:start",
      ({ conversationId }: { conversationId: string }) => {
        socket.to(`conversation:${conversationId}`).emit("typing:update", {
          conversationId,
          userId,
          userName: socket.data.userName,
          isTyping: true,
        });
      },
    );

    socket.on(
      "typing:stop",
      ({ conversationId }: { conversationId: string }) => {
        socket.to(`conversation:${conversationId}`).emit("typing:update", {
          conversationId,
          userId,
          userName: socket.data.userName,
          isTyping: false,
        });
      },
    );

    socket.on(
      "message:send",
      async ({
        conversationId,
        content,
        imageUrl,
      }: {
        conversationId: string;
        content: string;
        imageUrl?: string;
      }) => {
        try {
          const sanitized = sanitizeMessage(content ?? "");
          const message = await createMessage(
            userId,
            conversationId,
            sanitized,
            imageUrl,
          );

          await pushNewMessage(conversationId, message);
          socket.emit("message:sent", { conversationId, message });
        } catch (error) {
          socket.emit("error", {
            message: error instanceof Error ? error.message : "Send failed",
          });
        }
      },
    );

    socket.on("disconnect", () => {
      const wentOffline = markOffline(userId, socket.id);
      if (wentOffline) {
        io?.emit("presence:update", { userId, status: "offline" });
      }
    });
  });

  return io;
}
