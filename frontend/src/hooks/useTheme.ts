"use client";

import { useEffect, useState } from "react";
import { ThemeMode } from "@/types";

const KEY = "cc-theme";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) ?? "dark") as ThemeMode;
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  const toggle = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return { theme, toggle };
}