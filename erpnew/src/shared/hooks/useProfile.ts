"use client";

import { useEffect, useState } from "react";

export type UserProfile = {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  phone_number?: string;
  role?: string;
  avatar?: string;
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        setLoading(true);

        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            json?.error || json?.message || "Failed to fetch profile"
          );
        }

        const profileData = json?.data || null;

        if (!ignore) {
          setProfile(profileData);
        }
      } catch (error) {
        if (!ignore) {
          setProfile(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  return { profile, loading };
}