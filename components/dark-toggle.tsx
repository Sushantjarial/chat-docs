"use client";

import React, { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";
export default function DarkToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialize from localStorage or system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
        return;
      }
      if (stored === "light") {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
        return;
      }
    } catch (e) {
      // ignore
    }

    // fallback to prefers-color-scheme
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch (e) {
      // ignore
    }
  }, [isDark]);

  return (
    <Switch
      onClick={() => setIsDark((s) => !s)}
      aria-pressed={isDark}
      title="Toggle dark mode"
    ></Switch>
  );
}
