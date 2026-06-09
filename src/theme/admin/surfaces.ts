import { alpha } from "@mui/material/styles";
import { adminBrand, adminSurfaces } from "./colors";

export const ADMIN_CARD_RADIUS = 16;

const softShadow = `0 4px 24px ${adminSurfaces.cardShadow}`;
const softShadowHover = `0 8px 32px ${adminSurfaces.cardShadowHover}`;

export const adminSoftCardSx = {
  p: 3,
  height: "100%",
  borderRadius: `${ADMIN_CARD_RADIUS}px`,
  border: "none",
  bgcolor: "background.paper",
  boxShadow: softShadow,
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  "&:hover": {
    boxShadow: softShadowHover,
  },
} as const;

export const adminStatCardSx = {
  ...adminSoftCardSx,
  position: "relative" as const,
  p: 2.5,
  "&:hover": {
    boxShadow: softShadowHover,
    transform: "translateY(-2px)",
  },
} as const;

export const adminHeroCardSx = {
  ...adminSoftCardSx,
  mb: 3,
  background: `linear-gradient(135deg, ${alpha(adminBrand.primary, 0.04)} 0%, ${alpha(adminBrand.secondary, 0.08)} 100%)`,
} as const;

export const adminIconBadgeSx = {
  width: 44,
  height: 44,
  borderRadius: 2.5,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: alpha(adminBrand.primary, 0.08),
  color: "primary.main",
  flexShrink: 0,
} as const;
