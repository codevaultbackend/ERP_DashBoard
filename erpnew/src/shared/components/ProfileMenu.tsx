"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useProfile } from "@/shared/hooks/useProfile";

function getProfilePath(pathname: string) {
  if (pathname.startsWith("/head-office")) return "/head-office/profile";
  if (pathname.startsWith("/state")) return "/state/profile";
  if (pathname.startsWith("/district")) return "/district/profile";
  return "/retail/profile";
}

export default function ProfileMenu() {
  const pathname = usePathname();
  const { profile } = useProfile();

  const profilePath = useMemo(() => getProfilePath(pathname), [pathname]);

  return (
    <Link
      href={profilePath}
      className="flex items-center gap-3 rounded-full border border-[#E7E9EE] bg-white px-3 py-2 shadow-[0px_4px_14px_rgba(15,23,42,0.04)]"
    >
      <img
        src={profile?.avatar || "https://i.pravatar.cc/100?img=12"}
        alt="profile"
        className="h-[40px] w-[40px] rounded-full object-cover"
      />

      <div className="hidden sm:block">
        <p className="text-[15px] font-medium text-[#111827]">
          {profile?.name || "User"}
        </p>
        <p className="text-[12px] text-[#6B7280]">
          {profile?.role || "ERP User"}
        </p>
      </div>
    </Link>
  );
}