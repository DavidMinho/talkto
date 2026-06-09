import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { isAllowedCloudinaryUrl } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin-access";
import { UserRoles } from "@/lib/roles";
import { ApiError, ApiErrorCodes } from "@/lib/api/errors";

function resolveRoleForNewUser(email: string): UserRole {
  if (isAdminEmail(email)) {
    return UserRoles.ADMIN;
  }
  return UserRoles.USER;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new ApiError(
      ApiErrorCodes.CONFLICT,
      "Email already registered",
      409,
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const adminCount = await prisma.user.count({
    where: { role: UserRoles.ADMIN },
  });
  const role =
    adminCount === 0
      ? UserRoles.ADMIN
      : resolveRoleForNewUser(normalizedEmail);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  });

  if (!user) {
    throw new ApiError(ApiErrorCodes.NOT_FOUND, "User not found", 404);
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string | null },
) {
  const updates: { name?: string; avatarUrl?: string | null } = {};

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name || name.length > 80) {
      throw new ApiError(
        ApiErrorCodes.VALIDATION_ERROR,
        "Name must be 1–80 characters",
        400,
      );
    }
    updates.name = name;
  }

  if (data.avatarUrl !== undefined) {
    const avatarUrl = data.avatarUrl?.trim() || null;
    if (avatarUrl && !isAllowedCloudinaryUrl(avatarUrl)) {
      throw new ApiError(
        ApiErrorCodes.VALIDATION_ERROR,
        "Invalid avatar URL",
        400,
      );
    }
    updates.avatarUrl = avatarUrl;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "No profile fields to update",
      400,
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  });

  return user;
}

export async function searchUsers(
  userId: string,
  query: string,
  limit = 10,
) {
  const needle = query.toLowerCase();

  // SQLite does not support `mode: "insensitive"` — filter in memory
  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  return users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle),
    )
    .slice(0, limit);
}
