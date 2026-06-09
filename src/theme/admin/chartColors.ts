import { alpha } from "@mui/material/styles";
import { adminBrand } from "./colors";

export const adminChartColors = {
  primary: adminBrand.primary,
  secondary: adminBrand.secondary,
  accent: "#333333",
  muted: alpha(adminBrand.primary, 0.12),
  grid: alpha(adminBrand.primary, 0.08),
  segments: ["#000000", "#ce9b62", "#333333", "#8b93a8"],
} as const;
