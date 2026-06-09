import { z } from "zod";
import { ConversationListItemSchema, MessageSchema, UserSummarySchema } from "./common";

export const CreateGroupRequestSchema = z.object({
  name: z.string().min(1).max(100),
});

export const CreateDmRequestSchema = z.object({
  targetUserId: z.string().min(1),
});

export const ConversationListSchema = z.array(ConversationListItemSchema);

export const ConversationDetailSchema = z.object({
  id: z.string(),
  type: z.enum(["GROUP", "DM"]),
  name: z.string().nullable(),
  members: z.array(
    UserSummarySchema.extend({
      role: z.enum(["OWNER", "MEMBER"]),
      isOnline: z.boolean().optional(),
    }),
  ),
  peer: UserSummarySchema.optional(),
});

export const MessagesResponseSchema = z.object({
  messages: z.array(MessageSchema),
  nextCursor: z.string().nullable(),
});

export const SendMessageRequestSchema = z
  .object({
    content: z.string().max(4000).optional().default(""),
    imageUrl: z.string().url().optional(),
  })
  .refine(
    (data) => Boolean(data.imageUrl) || Boolean(data.content?.trim()),
    { message: "Message must include text or an image" },
  );

export const MarkReadResponseSchema = z.object({
  lastReadAt: z.string(),
});
