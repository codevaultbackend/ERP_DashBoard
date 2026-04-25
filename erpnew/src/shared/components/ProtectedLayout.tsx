"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getRoleHome,
  getRolePrefix,
  getStoredRole,
  getStoredToken,
} from "@/shared/lib/erp-auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const isLoginPage = useMemo(() => pathname === "/login", [pathname]);

  useEffect(() => {
    const token = getStoredToken();
    const role = getStoredRole();

    console.log("ProtectedLayout token:", token);
    console.log("ProtectedLayout role:", role);
    console.log("ProtectedLayout pathname:", pathname);

    if (isLoginPage) {
      setAllowed(true);
      setChecking(false);
      return;
    }

    if (!token) {
      setAllowed(false);
      setChecking(false);
      router.replace("/login");
      return;
    }

    if (!role) {
      setAllowed(false);
      setChecking(false);
      router.replace("/login");
      return;
    }

    const allowedPrefix = getRolePrefix(role);
    const roleHome = getRoleHome(role);

    console.log("allowedPrefix:", allowedPrefix);
    console.log("roleHome:", roleHome);

    if (!allowedPrefix || allowedPrefix === "/") {
      setAllowed(false);
      setChecking(false);
      router.replace("/login");
      return;
    }

    const canAccess =
      pathname === allowedPrefix || pathname.startsWith(`${allowedPrefix}/`);

    if (!canAccess) {
      setAllowed(false);
      setChecking(false);
      router.replace(roleHome);
      return;
    }

    setAllowed(true);
    setChecking(false);
  }, [pathname, router, isLoginPage]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-[#6B7280]">Checking access...</p>
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}