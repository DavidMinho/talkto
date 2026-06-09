"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import ProfileSettingsDialog from "@/components/ProfileSettingsDialog";
import UserAvatar from "@/components/UserAvatar";
import ChatSidebar from "@/components/ChatSidebar";
import AdminAccessAlert from "@/components/AdminAccessAlert";
import ChatBrandLogo from "./ChatBrandLogo";
import { connectSocket } from "@/lib/socket-client";
import { ChatShellContext } from "./ChatShellContext";
import {
  ADMIN_DRAWER_WIDTH,
  adminDrawerPaperSx,
} from "@/theme/admin/shellConfig";
import { CHAT_PANEL_RADIUS } from "@/theme/chat/surfaces";

const DRAWER_WIDTH = ADMIN_DRAWER_WIDTH;

export default function ChatShell({
  children,
  activeConversationId,
}: {
  children: React.ReactNode;
  activeConversationId?: string;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) connectSocket();
  }, [session?.user]);

  const sidebarBody = (
    <ChatSidebar
      activeConversationId={activeConversationId}
      onNavigate={() => setMobileOpen(false)}
    />
  );

  const sidebarFooter = session ? (
    <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
        <UserAvatar
          name={session.user?.name}
          avatarUrl={session.user?.avatarUrl}
          size={36}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {session.user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {session.user?.email}
          </Typography>
        </Box>
      </Stack>
      <Button
        size="small"
        fullWidth
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={() => setProfileOpen(true)}
        sx={{ mb: 1 }}
      >
        แก้ไขโปรไฟล์
      </Button>
      {session.user?.role === "ADMIN" && (
        <Button
          component={Link}
          href="/admin"
          size="small"
          fullWidth
          variant="outlined"
          startIcon={<AdminPanelSettingsIcon />}
          sx={{ mb: 1 }}
        >
          Admin
        </Button>
      )}
      <Button
        size="small"
        fullWidth
        variant="text"
        startIcon={<LogoutIcon />}
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        ออกจากระบบ
      </Button>
    </Box>
  ) : null;

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 2, py: 2, display: "flex", justifyContent: "center" }}>
        <ChatBrandLogo />
      </Box>
      <Divider sx={{ mx: 1.5 }} />
      <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{sidebarBody}</Box>
      {sidebarFooter}
    </Box>
  );

  return (
    <ChatShellContext.Provider
      value={{
        openSidebar: () => setMobileOpen(true),
        isMobile,
      }}
    >
      <ProfileSettingsDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
        <Box
          component="nav"
          sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                ...adminDrawerPaperSx,
                width: DRAWER_WIDTH,
              },
            }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                ...adminDrawerPaperSx,
                width: DRAWER_WIDTH,
                boxSizing: "border-box",
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            minWidth: 0,
            minHeight: 0,
            p: { xs: 0, md: 2 },
            pb: { md: 2 },
          }}
        >
          <AdminAccessAlert />
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
              borderRadius: { xs: 0, md: `${CHAT_PANEL_RADIUS}px` },
              boxShadow: (t) =>
                t.palette.mode === "light"
                  ? `0 4px 24px rgba(0, 0, 0, 0.08)`
                  : "none",
              overflow: "hidden",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ChatShellContext.Provider>
  );
}
