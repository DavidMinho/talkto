"use client";

import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Tooltip from "@mui/material/Tooltip";

export default function ThemeToggle() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("talkto-theme") as
      | "light"
      | "dark"
      | null;
    if (stored) setMode(stored);

    const handler = (e: Event) => {
      setMode((e as CustomEvent<"light" | "dark">).detail);
    };
    window.addEventListener("talkto-theme-change", handler);
    return () => window.removeEventListener("talkto-theme-change", handler);
  }, []);

  const toggle = () => {
    const next = mode === "light" ? "dark" : "light";
    localStorage.setItem("talkto-theme", next);
    setMode(next);
    window.dispatchEvent(
      new CustomEvent("talkto-theme-change", { detail: next }),
    );
  };

  return (
    <Tooltip title="สลับโหมดสี">
      <IconButton color="inherit" onClick={toggle} aria-label="toggle theme">
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
