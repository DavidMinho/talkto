"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PeopleIcon from "@mui/icons-material/People";
import Link from "next/link";
import { adminSoftCardSx, adminIconBadgeSx } from "@/theme/admin/surfaces";

type RecentUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

export default function AdminRecentUsersCard({
  users,
}: {
  users: RecentUser[];
}) {
  return (
    <Paper sx={adminSoftCardSx}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
        <Box sx={adminIconBadgeSx}>
          <PeopleIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            สมาชิกล่าสุด
          </Typography>
          <Typography variant="body2" color="text.secondary">
            5 รายการล่าสุดในระบบ
          </Typography>
        </Box>
        <Button component={Link} href="/admin/users" size="small" variant="outlined">
          ดูทั้งหมด
        </Button>
      </Stack>

      {users.length === 0 ? (
        <Typography color="text.secondary">ยังไม่มีสมาชิก</Typography>
      ) : (
        <Stack spacing={1.5}>
          {users.map((user) => (
            <Stack
              key={user.id}
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                p: 1.5,
                borderRadius: 2,
                bgcolor: "background.default",
              }}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
                {user.name[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
              <Chip
                label={user.role}
                size="small"
                color={user.role === "ADMIN" ? "primary" : "default"}
                variant={user.role === "ADMIN" ? "filled" : "outlined"}
              />
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
