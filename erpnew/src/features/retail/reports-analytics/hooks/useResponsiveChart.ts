"use client";

import { useEffect, useState } from "react";

export function useResponsiveChart() {
  const [screen, setScreen] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width < 640) setScreen("mobile");
      else if (width < 1024) setScreen("tablet");
      else setScreen("desktop");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    isMobile: screen === "mobile",
    barSize: screen === "mobile" ? 22 : screen === "tablet" ? 28 : 38,
    pieOuterRadius: screen === "mobile" ? 72 : screen === "tablet" ? 95 : 124,
    metalBarSize: screen === "mobile" ? 26 : screen === "tablet" ? 38 : 58,
  };
}