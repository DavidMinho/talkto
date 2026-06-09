import { alpha } from "@mui/material/styles";

export const adminBrand = {
  primary: "#000000",
  secondary: "#ce9b62",
} as const;

export const adminSurfaces = {
  pageBg: "#f0f2f8",
  sidebarBg: "#ffffff",
  cardShadow: alpha(adminBrand.primary, 0.08),
  cardShadowHover: alpha(adminBrand.primary, 0.14),
} as const;
