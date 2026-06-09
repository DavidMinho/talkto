"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";

export default function AdminLayout({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
}) {
  return (
    <AdminThemeProvider>
      <AdminShell userName={userName} userEmail={userEmail}>
        {children}
      </AdminShell>
    </AdminThemeProvider>
  );
}
