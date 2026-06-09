"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ApiIcon from "@mui/icons-material/Api";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminBrandLogo from "./AdminBrandLogo";
import AdminPageHeader from "./AdminPageHeader";
import {
  ADMIN_DRAWER_WIDTH,
  adminBottomNavButtonSx,
  adminDrawerPaperSx,
  adminNavButtonSx,
  adminSectionLabelSx,
} from "@/theme/admin/shellConfig";

const NAV_SECTIONS = [
  {
    label: "ภาพรวม",
    items: [
      { href: "/admin", label: "แดชบอร์ด", icon: <DashboardIcon fontSize="small" /> },
    ],
  },
  {
    label: "จัดการ",
    items: [
      { href: "/admin/users", label: "สมาชิก", icon: <PeopleIcon fontSize="small" /> },
      { href: "/admin/docs", label: "API Docs", icon: <ApiIcon fontSize="small" /> },
    ],
  },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {NAV_SECTIONS.map((section, sectionIndex) => (
        <Box key={section.label}>
          {sectionIndex > 0 && <Divider sx={{ mx: 1.5, my: 0.5 }} />}
          <Typography variant="caption" sx={{ ...adminSectionLabelSx, pt: sectionIndex > 0 ? 1 : 0 }}>
            {section.label}
          </Typography>
          {section.items.map((item) => (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
              }
              onClick={onNavigate}
              sx={adminNavButtonSx}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: { sx: { fontWeight: 500, fontSize: "0.875rem" } },
                }}
              />
            </ListItemButton>
          ))}
        </Box>
      ))}
      <Divider sx={{ mx: 1.5, my: 1 }} />
      <ListItemButton component={Link} href="/chats" onClick={onNavigate} sx={adminBottomNavButtonSx}>
        <ListItemIcon>
          <ChatIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="กลับไปแชท" />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          onNavigate?.();
          signOut({ callbackUrl: "/login" });
        }}
        sx={adminBottomNavButtonSx}
      >
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="ออกจากระบบ" />
      </ListItemButton>
    </>
  );
}

export default function AdminShell({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", py: 1.5 }}>
      <Box sx={{ px: 2, pb: 2, display: "flex", justifyContent: "center" }}>
        <AdminBrandLogo />
      </Box>
      <List disablePadding sx={{ flex: 1, px: 0.5 }}>
        <NavList onNavigate={() => setMobileOpen(false)} />
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="nav"
        sx={{ width: { md: ADMIN_DRAWER_WIDTH }, flexShrink: { md: 0 } }}
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
              width: ADMIN_DRAWER_WIDTH,
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
              width: ADMIN_DRAWER_WIDTH,
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
          width: { md: `calc(100% - ${ADMIN_DRAWER_WIDTH}px)` },
          p: { xs: 2, sm: 3, md: 4 },
          minWidth: 0,
        }}
      >
        <AdminPageHeader
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setMobileOpen(true)}
          showMenuButton={isMobile}
        />
        {children}
      </Box>
    </Box>
  );
}
