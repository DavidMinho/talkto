import { redirect } from "next/navigation";
import { UserRoles } from "@/lib/roles";
import AdminLayout from "@/components/AdminLayout";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });

  if (user?.role !== UserRoles.ADMIN) {
    redirect("/chats?error=not_admin");
  }

  return (
    <AdminLayout userName={user?.name} userEmail={user?.email}>
      {children}
    </AdminLayout>
  );
}
