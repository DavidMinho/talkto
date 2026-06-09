/**
 * Promote a user to ADMIN.
 * Usage:
 *   npm run db:promote-admin -- email@example.com
 *   npm run db:promote-admin   (only when no admin exists — promotes first user)
 */
import { PrismaClient } from "@prisma/client";
import { UserRoles } from "../src/lib/roles";

const prisma = new PrismaClient();

async function main() {
  const emailArg = process.argv[2]?.trim().toLowerCase();

  if (emailArg) {
    const user = await prisma.user.findUnique({ where: { email: emailArg } });
    if (!user) {
      console.log(`ไม่พบผู้ใช้: ${emailArg}`);
      return;
    }
    if (user.role === UserRoles.ADMIN) {
      console.log(`${user.email} เป็น ADMIN อยู่แล้ว`);
      return;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRoles.ADMIN },
    });
    console.log(`เลื่อน ${user.email} เป็น ADMIN แล้ว — รีเฟรชหน้า /admin`);
    return;
  }

  const adminCount = await prisma.user.count({
    where: { role: UserRoles.ADMIN },
  });

  if (adminCount > 0) {
    console.log(`มี ADMIN อยู่แล้ว ${adminCount} คน`);
    console.log("เลื่อนบัญชีของคุณด้วยคำสั่ง:");
    console.log("  npm run db:promote-admin -- your@email.com");
    return;
  }

  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    console.log("ยังไม่มีผู้ใช้ในระบบ");
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: UserRoles.ADMIN },
  });

  console.log(`เลื่อน ${user.email} เป็น ADMIN แล้ว`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
