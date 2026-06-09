import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { UserRoles } from "@/lib/roles";

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase());
}

/** Promote to ADMIN when email is listed in ADMIN_EMAILS. */
export async function ensureAdminRole(
  userId: string,
  email: string,
): Promise<UserRole> {
  if (isAdminEmail(email)) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: UserRoles.ADMIN },
      select: { role: true },
    });
    return updated.role;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? UserRoles.USER;
}
