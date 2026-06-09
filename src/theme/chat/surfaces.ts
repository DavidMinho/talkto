import { alpha } from "@mui/material/styles";
import { adminBrand, adminSurfaces } from "@/theme/admin/colors";
import { ADMIN_CARD_RADIUS } from "@/theme/admin/surfaces";

/** Card / panel corners — matches admin cards */
export const CHAT_PANEL_RADIUS = ADMIN_CARD_RADIUS;
export const CHAT_BUBBLE_RADIUS = 24;
export const CHAT_BUBBLE_TAIL_RADIUS = 8;
export const CHAT_IMAGE_RADIUS = 20;
export const CHAT_INPUT_RADIUS = 24;
export const CHAT_ACTION_RADIUS = 16;

export const ownBubbleRadius = `${CHAT_BUBBLE_RADIUS}px ${CHAT_BUBBLE_RADIUS}px ${CHAT_BUBBLE_TAIL_RADIUS}px ${CHAT_BUBBLE_RADIUS}px`;
export const otherBubbleRadius = `${CHAT_BUBBLE_RADIUS}px ${CHAT_BUBBLE_RADIUS}px ${CHAT_BUBBLE_RADIUS}px ${CHAT_BUBBLE_TAIL_RADIUS}px`;

export const chatListSx = {
  flex: 1,
  overflow: "auto",
  px: 1.5,
  py: 1,
  bgcolor: adminSurfaces.pageBg,
} as const;

export const chatListItemSx = {
  alignItems: "flex-start",
  py: 1.25,
  mb: 0.75,
  borderRadius: `${CHAT_ACTION_RADIUS}px`,
  border: "1px solid",
  borderColor: alpha(adminBrand.primary, 0.1),
  bgcolor: "#ffffff",
  color: "text.primary",
  transition: "background-color 0.15s ease, border-color 0.15s ease",
  "&:hover": {
    bgcolor: alpha(adminBrand.primary, 0.04),
    borderColor: alpha(adminBrand.primary, 0.2),
  },
  "&.Mui-unread:not(.Mui-selected)": {
    bgcolor: alpha(adminBrand.secondary, 0.06),
    borderColor: alpha(adminBrand.secondary, 0.35),
    boxShadow: `inset 3px 0 0 ${alpha(adminBrand.secondary, 0.6)}`,
  },
  "&.Mui-selected": {
    bgcolor: alpha(adminBrand.primary, 0.1),
    borderColor: adminBrand.primary,
    boxShadow: `inset 3px 0 0 ${adminBrand.primary}`,
    "&:hover": {
      bgcolor: alpha(adminBrand.primary, 0.14),
    },
    "& .MuiListItemText-primary": {
      color: adminBrand.primary,
      fontWeight: 700,
    },
    "& .MuiListItemText-secondary": {
      color: alpha(adminBrand.primary, 0.72),
    },
  },
  "&.Mui-selected.Mui-unread": {
    bgcolor: alpha(adminBrand.secondary, 0.12),
    borderColor: adminBrand.secondary,
    boxShadow: `inset 3px 0 0 ${adminBrand.secondary}`,
  },
} as const;
