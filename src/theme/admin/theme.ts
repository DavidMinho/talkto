import { alpha, createTheme } from "@mui/material/styles";
import { adminBrand, adminSurfaces } from "./colors";
import { ADMIN_CARD_RADIUS } from "./surfaces";

const primary = {
  main: adminBrand.primary,
  light: "#333333",
  dark: "#000000",
  contrastText: "#ffffff",
};

const secondary = {
  main: adminBrand.secondary,
  light: "#e0b888",
  dark: "#a67d42",
  contrastText: "#ffffff",
};

export const adminTheme = createTheme({
  palette: {
    primary,
    secondary,
    background: {
      default: adminSurfaces.pageBg,
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1d26",
      secondary: "#8b93a8",
    },
    divider: alpha(primary.main, 0.08),
  },
  typography: {
    fontFamily:
      '"Noto Sans Thai", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: adminSurfaces.pageBg },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: ADMIN_CARD_RADIUS,
          boxShadow: `0 4px 24px ${adminSurfaces.cardShadow}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          boxShadow: "none",
        },
        contained: {
          boxShadow: `0 4px 14px ${alpha(primary.main, 0.25)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "none",
          boxShadow: `4px 0 24px ${alpha(primary.main, 0.04)}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          bgcolor: alpha(primary.main, 0.02),
        },
        notchedOutline: {
          borderColor: alpha(primary.main, 0.12),
        },
      },
    },
  },
});
