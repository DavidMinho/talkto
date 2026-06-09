import type { UserRole } from "@prisma/client";

/** Runtime-safe role values (avoids stale Prisma enum imports during HMR). */
export const UserRoles = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const satisfies Record<string, UserRole>;
