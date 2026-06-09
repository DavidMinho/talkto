"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "@/theme/theme";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("talkto-theme") as
      | "light"
      | "dark"
      | null;
    if (stored) setMode(stored);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<"light" | "dark">).detail;
      setMode(detail);
    };
    window.addEventListener("talkto-theme-change", handler);
    return () => window.removeEventListener("talkto-theme-change", handler);
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
