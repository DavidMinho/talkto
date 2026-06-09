import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
  role: z.enum(["USER", "ADMIN"]),
});

export const UpdateProfileRequestSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .refine((data) => data.name !== undefined || data.avatarUrl !== undefined, {
    message: "At least one field is required",
  });
