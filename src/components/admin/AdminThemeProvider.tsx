"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { adminTheme } from "@/theme/admin/theme";

export default function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
