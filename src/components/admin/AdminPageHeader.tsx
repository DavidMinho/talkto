"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export default function AdminPageHeader({
  userName,
  userEmail,
  subtitle = "พื้นที่ผู้ดูแลระบบ Talkto",
  onMenuClick,
  showMenuButton,
}: {
  userName?: string | null;
  userEmail?: string | null;
  subtitle?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}) {
  const firstName = userName?.split(/\s+/)[0] ?? userName ?? "ผู้ดูแล";

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{ alignItems: { md: "center" }, justifyContent: "space-between", gap: 2 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flex: 1 }}>
          {showMenuButton && (
            <IconButton onClick={onMenuClick} sx={{ display: { md: "none" } }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2rem" },
                lineHeight: 1.2,
              }}
            >
              ยินดีต้อนรับกลับ, {firstName}!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Chip
            icon={<AdminPanelSettingsIcon />}
            label="ADMIN"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, display: { xs: "none", sm: "flex" } }}
          />
          {userName && (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                bgcolor: "background.paper",
                borderRadius: 3,
                px: 1.5,
                py: 0.75,
                boxShadow: (t) => `0 2px 12px ${t.palette.divider}`,
              }}
            >
              <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
                {userName[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  {userName}
                </Typography>
                {userEmail && (
                  <Typography variant="caption" color="text.secondary">
                    {userEmail}
                  </Typography>
                )}
              </Box>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
