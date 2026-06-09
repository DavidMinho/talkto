import { z } from "zod";

export const CreateInviteRequestSchema = z.object({
  inviteType: z.enum(["GROUP", "DM"]),
  expiresInDays: z.number().int().min(1).max(30).default(7),
  maxUses: z.number().int().positive().nullable().optional(),
});

export const CreateInviteResponseSchema = z.object({
  token: z.string(),
  url: z.string().url(),
  expiresAt: z.string(),
});

export const InviteDetailSchema = z.object({
  inviteType: z.enum(["GROUP", "DM"]),
  conversation: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      memberCount: z.number(),
    })
    .nullable(),
  inviter: z.object({ name: z.string() }),
  expiresAt: z.string(),
  isValid: z.boolean(),
});

export const AcceptInviteResponseSchema = z.object({
  conversationId: z.string(),
  redirectUrl: z.string(),
});

export const SendGroupUserInviteRequestSchema = z.object({
  targetUserId: z.string().min(1),
});

export const SendGroupUserInviteResponseSchema = z.object({
  inviteToken: z.string(),
  dmConversationId: z.string(),
  targetUser: z.object({ id: z.string(), name: z.string() }),
});
