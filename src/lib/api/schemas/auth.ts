import { z } from "zod";

export const RegisterRequestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const RegisterResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
