"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../Component/DashboardLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ProfileUser = {
  id?: number;
  email?: string;
  username?: string;
  name?: string;
  phoneNumber?: string;
  phone?: string;
  profile_image?: string | null;
  storeCode?: string;
  store_code?: string;
  organizationLevel?: string;
  organization_level?: string;
  role?: string;
  is_profile_set?: boolean;
};

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const keys = [
    "token",
    "accessToken",
    "authToken",
    "ims_token",
    "imsToken",
    "jwt",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value) return value;
  }

  return "";
}

export default function Profile() {
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(
    "https://i.pravatar.cc/300?img=12"
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isProfileSet = Boolean(profile?.is_profile_set);

  const lastPasswordChange = useMemo(() => {
    return "Not available";
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setMessage(null);

      const token = getAuthToken();

      const res = await fetch(`${API_BASE}/Profile/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to load profile");
      }

      const userData: ProfileUser = data?.user || {};

      setProfile(userData);
      setName(userData.username || userData.name || user?.name || "");
      setEmail(userData.email || user?.email || "");
      setPhone(userData.phoneNumber || userData.phone || "");
      setPreviewImage(
        userData.profile_image || "https://i.pravatar.cc/300?img=12"
      );
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Something went wrong while loading profile",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please select a valid image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Image size should be less than 5MB",
      });
      return;
    }

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setMessage(null);
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage(null);

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token missing. Please login again.");
      }

      const formData = new FormData();

      let endpoint = "";
      let method: "POST" | "PUT" = "POST";

      if (isProfileSet) {
        if (!imageFile) {
          throw new Error(
            "Your backend update API currently requires profile image."
          );
        }

        endpoint = `${API_BASE}/Profile/update-profile`;
        method = "PUT";

        formData.append("image", imageFile);
        formData.append("profile_image", imageFile);
      } else {
        if (!name.trim()) {
          throw new Error("Full name is required");
        }

        if (!phone.trim()) {
          throw new Error("Phone number is required");
        }

        endpoint = `${API_BASE}/Profile/set-profile`;
        method = "POST";

        formData.append("name", name.trim());
        formData.append("phone", phone.trim());

        if (imageFile) {
          formData.append("image", imageFile);
          formData.append("profile_image", imageFile);
        }
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || "Failed to update profile"
        );
      }

      setMessage({
        type: "success",
        text: data?.message || "Profile updated successfully",
      });

      setImageFile(null);
      await fetchProfile();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen w-full bg-[#F6F8FA] px-4 py-6 sm:px-3">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-[20px] font-[500] text-black">My Profile</h2>

            {loading && (
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading profile...
              </div>
            )}
          </div>

          {message && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-[16px] border px-4 py-3 text-[14px] shadow-sm ${
                message.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="mt-[1px] h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-[1px] h-5 w-5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="relative mx-auto mb-12 h-[124px] w-[124px] sm:mx-0">
            <img
              src={previewImage}
              alt="profile"
              className="h-full w-full rounded-full border border-[#E5E7EB] object-cover shadow-[0_8px_22px_rgba(0,0,0,0.08)]"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-md transition hover:scale-105 active:scale-95"
            >
              <Pencil className="h-5 w-5 text-black" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="space-y-7">
            <div>
              <label className="mb-3 block text-[16px] font-medium text-black">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                disabled={isProfileSet}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="h-[48px] w-full rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[16px] text-black shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none transition placeholder:text-gray-400 focus:border-[#0D4CBA] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
              />

              {isProfileSet && (
                <p className="mt-2 text-[12px] text-gray-400">
                  Name update is disabled because your current backend update API
                  only updates profile image.
                </p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-[16px] font-medium text-black">
                Email ID
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="h-[48px] w-full cursor-not-allowed rounded-[18px] border border-[#E5E7EB] bg-gray-50 px-5 text-[16px] text-gray-500 shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none"
              />
            </div>

            <div>
              <label className="mb-3 block text-[16px] font-medium text-black">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                disabled={isProfileSet}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="h-[48px] w-full rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[16px] text-black shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none transition placeholder:text-gray-400 focus:border-[#0D4CBA] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <button
              type="button"
              className="flex h-[82px] w-full items-center justify-between rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition hover:bg-gray-50 active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="text-[16px] font-[500] text-black">**|</div>

                <div>
                  <p className="text-[16px] font-medium text-black">
                    Change Password
                  </p>

                  <span className="text-[12px] text-gray-400">
                    Last Change {lastPasswordChange}
                  </span>
                </div>
              </div>

              <ArrowRight className="h-7 w-7 text-black" />
            </button>
          </div>

          <div className="mt-10">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#0D4CBA] text-[16px] font-medium text-white shadow-[0_6px_14px_rgba(13,76,186,0.35)] transition hover:bg-[#0b42a0] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[230px]"
            >
              {saving && <Loader2 className="h-5 w-5 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}