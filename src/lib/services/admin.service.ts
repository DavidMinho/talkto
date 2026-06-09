import type { ConversationType, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { UserRoles } from "@/lib/roles";
import { ApiError, ApiErrorCodes } from "@/lib/api/errors";

const TH_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

function buildMonthlyBuckets() {
  const buckets: { key: string; month: string; count: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      month: TH_MONTHS[d.getMonth()],
      count: 0,
    });
  }

  return buckets;
}

export async function getAdminStats() {
  const [
    users,
    conversations,
    messages,
    admins,
    regularUsers,
    recentUsers,
    allUsersCreatedAt,
    conversationGroups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.user.count({ where: { role: UserRoles.ADMIN } }),
    prisma.user.count({ where: { role: UserRoles.USER } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({ select: { createdAt: true } }),
    prisma.conversation.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
  ]);

  const monthlySignups = buildMonthlyBuckets();
  const bucketMap = new Map(monthlySignups.map((b) => [b.key, b]));

  for (const user of allUsersCreatedAt) {
    const d = user.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = bucketMap.get(key);
    if (bucket) bucket.count += 1;
  }

  const conversationTypeBreakdown = (
    ["GROUP", "DM"] as ConversationType[]
  ).map((type) => {
    const row = conversationGroups.find((g) => g.type === type);
    return {
      name: type === "GROUP" ? "ห้องกลุ่ม" : "แชทส่วนตัว",
      value: row?._count._all ?? 0,
    };
  });

  const avgMessagesPerUser =
    users > 0 ? Math.round((messages / users) * 10) / 10 : 0;

  return {
    users,
    conversations,
    messages,
    admins,
    regularUsers,
    monthlySignups: monthlySignups.map(({ month, count }) => ({ month, value: count })),
    conversationTypeBreakdown,
    recentUsers: recentUsers.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
    insights: {
      avgMessagesPerUser,
      adminRatio: users > 0 ? Math.round((admins / users) * 100) : 0,
      groupRooms: conversationTypeBreakdown[0]?.value ?? 0,
      dmRooms: conversationTypeBreakdown[1]?.value ?? 0,
    },
  };
}

export async function listUsers(query?: string) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          memberships: true,
          messages: true,
        },
      },
    },
  });

  if (!query?.trim()) return users;

  const needle = query.toLowerCase();
  return users.filter(
    (u) =>
      u.name.toLowerCase().includes(needle) ||
      u.email.toLowerCase().includes(needle),
  );
}

export async function updateUser(
  userId: string,
  data: { name?: string; role?: UserRole },
  actorId: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(ApiErrorCodes.NOT_FOUND, "User not found", 404);
  }

  if (data.role === UserRoles.USER && user.role === UserRoles.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: UserRoles.ADMIN },
    });
    if (adminCount <= 1) {
      throw new ApiError(
        ApiErrorCodes.VALIDATION_ERROR,
        "Cannot demote the last admin",
        400,
      );
    }
  }

  if (userId === actorId && data.role === UserRoles.USER) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "Cannot demote yourself",
      400,
    );
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function deleteUser(userId: string, actorId: string) {
  if (userId === actorId) {
    throw new ApiError(
      ApiErrorCodes.VALIDATION_ERROR,
      "Cannot delete yourself",
      400,
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(ApiErrorCodes.NOT_FOUND, "User not found", 404);
  }

  if (user.role === UserRoles.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: UserRoles.ADMIN },
    });
    if (adminCount <= 1) {
      throw new ApiError(
        ApiErrorCodes.VALIDATION_ERROR,
        "Cannot delete the last admin",
        400,
      );
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  return { deleted: true };
}
