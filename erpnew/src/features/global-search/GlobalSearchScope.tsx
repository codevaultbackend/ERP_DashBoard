"use client";

import { useEffect, useRef } from "react";
import { useGlobalSearch } from "./GlobalSearchProvider";

export default function GlobalSearchScope({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { setSearchRoot } = useGlobalSearch();

  useEffect(() => {
    setSearchRoot(ref.current);
    return () => setSearchRoot(null);
  }, [setSearchRoot]);

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}