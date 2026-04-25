"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { ArrowRight, Pencil } from "lucide-react";
import { useProfile } from "@/shared/hooks/useProfile";

type FormState = {
  name: string;
  email: string;
  username: string;
  phone_number: string;
  aadhaar_url: string;
  pan_url: string;
  police_doc_url: string;
};

export default function ProfilePage() {
  const { profile, loading, saving, error, saveProfile } = useProfile();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    username: "",
    phone_number: "",
    aadhaar_url: "",
    pan_url: "",
    police_doc_url: "",
  });

  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!profile) return;

    setForm({
      name: profile.name || "",
      email: profile.email || "",
      username: profile.username || "",
      phone_number: profile.phone_number || "",
      aadhaar_url: profile.aadhaar_url || "",
      pan_url: profile.pan_url || "",
      police_doc_url: profile.police_doc_url || "",
    });
  }, [profile]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave() {
    try {
      setSuccess("");

      await saveProfile({
        name: form.name,
        username: form.username,
        phone_number: form.phone_number,
        aadhaar_url: form.aadhaar_url,
        pan_url: form.pan_url,
        police_doc_url: form.police_doc_url,
      });

      setSuccess("Profile updated successfully.");
    } catch {}
  }

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] bg-[#F6F8FA] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[15px] text-[#6B7280]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen !pl-0 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="mb-8 text-[22px] font-[600] tracking-[-0.03em] text-black sm:text-[24px]">
          My Profile
        </h2>

        <div className="relative mb-12 h-[124px] w-[124px]">
          <img
            src="https://i.pravatar.cc/300?img=12"
            alt="profile"
            className="h-full w-full rounded-full border border-[#E5E7EB] object-cover"
          />

          <button
            type="button"
            className="absolute bottom-2 right-2 flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-md"
          >
            <Pencil className="h-5 w-5 text-black" />
          </button>
        </div>

        <div className="space-y-7">
          <div>
            <label className="mb-3 block text-[16px] font-medium text-black">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="h-[52px] w-full rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[16px] outline-none shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            />
          </div>

          <div>
            <label className="mb-3 block text-[16px] font-medium text-black">
              Email ID
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              readOnly
              className="h-[52px] w-full cursor-not-allowed rounded-[18px] border border-[#E5E7EB] bg-[#F9FAFB] px-5 text-[16px] text-[#6B7280] outline-none shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
            />
          </div>

          <div>
            <label className="mb-3 block text-[16px] font-medium text-black">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="h-[52px] w-full rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[16px] outline-none shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            />
          </div>

          <div>
            <label className="mb-3 block text-[16px] font-medium text-black">
              Phone Number
            </label>

            <input
              type="text"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="h-[52px] w-full rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[16px] outline-none shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            />
          </div>

          <div>
            <label className="mb-3 block text-[16px] font-medium text-black">
              Aadhaar URL
            </label>

            <input
              type="text"
              name="aadhaar_url"
              value={form.aadhaar_url}
              onChange={handleChange}
              className="h-[52px] w-full rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[16px] outline-none shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            />
          </div>

          <div>
            <label className="mb-3 block text-[16px] font-medium text-black">
              PAN URL
            </label>

            <input
              type="text"
              name="pan_url"
              value={form.pan_url}
              onChange={handleChange}
              className="h-[52px] w-full rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[16px] outline-none shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            />
          </div>

          <div>
            <label className="mb-3 block text-[16px] font-medium text-black">
              Police Document URL
            </label>

            <input
              type="text"
              name="police_doc_url"
              value={form.police_doc_url}
              onChange={handleChange}
              className="h-[52px] w-full rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[16px] outline-none shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            />
          </div>

          <button
            type="button"
            className="flex h-[82px] w-full items-center justify-between rounded-[18px] border border-[#E5E7EB] bg-white px-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center gap-4">
              <div className="text-[16px] font-[500]">**|</div>

              <div className="text-left">
                <p className="text-[16px] font-medium text-black">
                  Change Password
                </p>
                <span className="text-[12px] text-gray-400">
                  Last Change 27 Jan. 2026
                </span>
              </div>
            </div>

            <ArrowRight className="h-7 w-7 text-black" />
          </button>
        </div>

        {error ? (
          <p className="mt-5 text-[14px] font-medium text-[#DC2626]">{error}</p>
        ) : null}

        {success ? (
          <p className="mt-5 text-[14px] font-medium text-[#16A34A]">{success}</p>
        ) : null}

        <div className="mt-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-[48px] w-full rounded-[16px] bg-[#0D4CBA] text-[16px] font-medium text-white shadow-[0_6px_14px_rgba(13,76,186,0.35)] transition hover:bg-[#0b42a0] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[230px]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}