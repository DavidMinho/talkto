"use client";

import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import PeopleIcon from "@mui/icons-material/People";
import ForumIcon from "@mui/icons-material/Forum";
import MessageIcon from "@mui/icons-material/Message";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { apiFetch } from "@/lib/api-client";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminChartsSection from "@/components/admin/AdminChartsSection";
import AdminRecentUsersCard from "@/components/admin/AdminRecentUsersCard";
import AdminInsightsCard from "@/components/admin/AdminInsightsCard";

type DashboardStats = {
  users: number;
  conversations: number;
  messages: number;
  admins: number;
  regularUsers: number;
  monthlySignups: { month: string; value: number }[];
  conversationTypeBreakdown: { name: string; value: number }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: string;
  }[];
  insights: {
    avgMessagesPerUser: number;
    adminRatio: number;
    groupRooms: number;
    dmRooms: number;
  };
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    apiFetch<DashboardStats>("/api/admin/stats")
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <>
      <AdminStatsCards
        stats={[
          {
            title: "สมาชิกทั้งหมด",
            value: String(stats?.users ?? 0),
            subtitle: "รวมทุกบัญชีในระบบ",
            icon: PeopleIcon,
          },
          {
            title: "ห้องแชท",
            value: String(stats?.conversations ?? 0),
            subtitle: `${stats?.insights.groupRooms ?? 0} กลุ่ม · ${stats?.insights.dmRooms ?? 0} ส่วนตัว`,
            icon: ForumIcon,
          },
          {
            title: "ข้อความทั้งหมด",
            value: String(stats?.messages ?? 0),
            subtitle: `เฉลี่ย ${stats?.insights.avgMessagesPerUser ?? 0} ต่อคน`,
            icon: MessageIcon,
          },
          {
            title: "ผู้ดูแลระบบ",
            value: String(stats?.admins ?? 0),
            subtitle: `${stats?.insights.adminRatio ?? 0}% ของสมาชิก`,
            icon: AdminPanelSettingsIcon,
          },
        ]}
      />

      <AdminChartsSection
        monthlySignups={stats?.monthlySignups ?? []}
        conversationTypeBreakdown={stats?.conversationTypeBreakdown ?? []}
        totalConversations={stats?.conversations ?? 0}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AdminRecentUsersCard users={stats?.recentUsers ?? []} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <AdminInsightsCard
            rows={[
              {
                label: "สมาชิกทั่วไป (USER)",
                value: `${stats?.regularUsers ?? 0} คน`,
                progress:
                  stats && stats.users > 0
                    ? (stats.regularUsers / stats.users) * 100
                    : 0,
              },
              {
                label: "ผู้ดูแลระบบ (ADMIN)",
                value: `${stats?.admins ?? 0} คน`,
                progress: stats?.insights.adminRatio ?? 0,
                highlight: true,
              },
              {
                label: "ห้องกลุ่ม",
                value: `${stats?.insights.groupRooms ?? 0} ห้อง`,
              },
              {
                label: "แชทส่วนตัว",
                value: `${stats?.insights.dmRooms ?? 0} ห้อง`,
              },
            ]}
          />
        </Grid>
      </Grid>
    </>
  );
}
