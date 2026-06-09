import { alpha } from "@mui/material/styles";
import { adminBrand, adminSurfaces } from "./colors";

export const ADMIN_DRAWER_WIDTH = 280;

export const adminDrawerPaperSx = {
  boxSizing: "border-box" as const,
  bgcolor: adminSurfaces.sidebarBg,
  borderRight: "none",
  overflowX: "hidden",
};

export const adminSectionLabelSx = {
  display: "block",
  px: 1.75,
  pb: 0.25,
  fontWeight: 700,
  color: "text.secondary",
  textTransform: "uppercase" as const,
  fontSize: "0.625rem",
  letterSpacing: "0.05em",
};

export const adminNavButtonSx = {
  color: "text.secondary",
  mx: 1,
  my: 0.1,
  py: 0.45,
  minHeight: 40,
  borderRadius: 1.5,
  "& .MuiListItemIcon-root": {
    color: "inherit",
    minWidth: 36,
  },
  "&:hover": {
    bgcolor: alpha(adminBrand.primary, 0.06),
    color: "text.primary",
  },
  "&.Mui-selected": {
    bgcolor: "primary.main",
    color: "primary.contrastText",
    "&:hover": { bgcolor: "primary.dark" },
    "& .MuiListItemIcon-root": { color: "inherit" },
  },
};

export const adminBottomNavButtonSx = {
  ...adminNavButtonSx,
  "&.Mui-selected": {
    bgcolor: alpha(adminBrand.primary, 0.08),
    color: "text.primary",
  },
};
