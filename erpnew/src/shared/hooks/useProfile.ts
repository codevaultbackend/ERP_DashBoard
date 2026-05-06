"use client";

import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const PROFILE_CACHE_KEY = "erp_cached_profile_v1";
const PROFILE_CACHE_TIME_KEY = "erp_cached_profile_time_v1";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export type UserProfile = {
  id?: string | number;
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
  phoneNumber?: string;
  phone_number?: string;
  role?: string;
  avatar?: string;
  profile_image?: string | null;
  store_code?: string;
  organization_level?: string;
  is_profile_set?: boolean;
};

type SaveProfilePayload = {
  name: string;
  phone?: string;
  phone_number?: string;
  image?: File | null;
};

function getToken() {
  if (typeof window === "undefined") return "";

  const keys = ["token", "accessToken", "authToken", "ims_token", "imsToken", "jwt"];

  for (const key of keys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value) return value;
  }

  return "";
}

function normalizeUser(user: any): UserProfile {
  return {
    id: user?.id,
    name: user?.name || user?.username || "",
    username: user?.username || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || user?.phoneNumber || user?.phone_number || "",
    phoneNumber: user?.phoneNumber || user?.phone || user?.phone_number || "",
    phone_number: user?.phone_number || user?.phoneNumber || user?.phone || "",
    role: user?.role || "",
    avatar: user?.avatar || user?.profile_image || "",
    profile_image: user?.profile_image || user?.avatar || "",
    store_code: user?.store_code || user?.storeCode || "",
    organization_level: user?.organization_level || user?.organizationLevel || "",
    is_profile_set: Boolean(user?.is_profile_set),
  };
}

function saveProfileCache(profile: UserProfile) {
  if (typeof window === "undefined") return;

  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  localStorage.setItem(PROFILE_CACHE_TIME_KEY, String(Date.now()));

  window.dispatchEvent(
    new CustomEvent("erp-profile-updated", {
      detail: profile,
    })
  );
}

function getProfileCache() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as UserProfile;
  } catch {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    return null;
  }
}

function isCacheFresh() {
  if (typeof window === "undefined") return false;

  const time = Number(localStorage.getItem(PROFILE_CACHE_TIME_KEY) || 0);
  return Boolean(time && Date.now() - time < CACHE_TTL);
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(() => getProfileCache());
  const [loading, setLoading] = useState(() => !getProfileCache());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async (force = false) => {
    try {
      const cached = getProfileCache();

      if (cached && !force) {
        setProfile(cached);
        setLoading(false);

        if (isCacheFresh()) {
          return cached;
        }
      }

      setLoading(!cached);
      setError("");

      const token = getToken();

      const res = await fetch(`${API_BASE}/Profile/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || json?.message || "Failed to fetch profile");
      }

      const userData = normalizeUser(json?.user);

      setProfile(userData);
      saveProfileCache(userData);

      return userData;
    } catch (err: any) {
      const cached = getProfileCache();

      if (cached) {
        setProfile(cached);
      } else {
        setProfile(null);
      }

      setError(err?.message || "Failed to fetch profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setProfileFirstTime = useCallback(async (payload: SaveProfilePayload) => {
    try {
      setSaving(true);
      setError("");

      const token = getToken();

      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("phone", payload.phone || payload.phone_number || "");

      if (payload.image) {
        formData.append("file", payload.image);
      }

      const res = await fetch(`${API_BASE}/Profile/set-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || json?.message || "Failed to set profile");
      }

      const userData = normalizeUser(json?.user);

      setProfile(userData);
      saveProfileCache(userData);

      return userData;
    } catch (err: any) {
      setError(err?.message || "Failed to set profile");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateProfilePicture = useCallback(async (image: File) => {
    try {
      setUploadingImage(true);
      setSaving(true);
      setError("");

      const token = getToken();

      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch(`${API_BASE}/Profile/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();

      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(text || "Backend returned non-JSON response");
      }

      if (!res.ok) {
        throw new Error(
          json?.message ||
            json?.error ||
            `Profile image update failed with status ${res.status}`
        );
      }

      const updatedImage = json?.data?.profile_image;

      setProfile((prev) => {
        const updatedProfile = {
          ...(prev || {}),
          profile_image: updatedImage || prev?.profile_image || "",
          avatar: updatedImage || prev?.avatar || "",
          is_profile_set: true,
        };

        saveProfileCache(updatedProfile);

        return updatedProfile;
      });

      return json?.data;
    } catch (err: any) {
      setError(err?.message || "Failed to update profile image");
      throw err;
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  }, []);

  const saveProfile = useCallback(
    async (payload: SaveProfilePayload) => {
      if (profile?.is_profile_set) {
        if (!payload.image) {
          throw new Error("Backend update profile API requires a profile image.");
        }

        return updateProfilePicture(payload.image);
      }

      return setProfileFirstTime(payload);
    },
    [profile?.is_profile_set, setProfileFirstTime, updateProfilePicture]
  );

  useEffect(() => {
    fetchProfile(false).catch(() => {});
  }, [fetchProfile]);

  useEffect(() => {
    function handleProfileUpdate(event: Event) {
      const customEvent = event as CustomEvent<UserProfile>;
      setProfile(customEvent.detail);
    }

    window.addEventListener("erp-profile-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("erp-profile-updated", handleProfileUpdate);
    };
  }, []);

  return {
    profile,
    loading,
    saving,
    uploadingImage,
    error,
    fetchProfile,
    saveProfile,
    setProfileFirstTime,
    updateProfilePicture,
  };
}