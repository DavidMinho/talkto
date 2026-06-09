import { z } from "zod";

export const UserSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().nullable().optional(),
});

export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  imageUrl: z.string().url().nullable().optional(),
  createdAt: z.string(),
  user: UserSummarySchema.pick({ id: true, name: true, avatarUrl: true }),
});

export const LastMessageSchema = z.object({
  content: z.string(),
  createdAt: z.string(),
});

export const ConversationListItemSchema = z.object({
  id: z.string(),
  type: z.enum(["GROUP", "DM"]),
  name: z.string().nullable(),
  unreadCount: z.number(),
  memberCount: z.number().optional(),
  peer: UserSummarySchema.optional(),
  lastMessage: LastMessageSchema.nullable(),
  updatedAt: z.string(),
});
