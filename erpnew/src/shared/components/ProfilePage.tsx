"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Pencil } from "lucide-react";
import { useProfile } from "@/shared/hooks/useProfile";

type FormState = {
  name: string;
  role: string;
  branch_store: string;
  email: string;
  phone_number: string;
};

export default function ProfilePage() {
  const {
    profile,
    loading,
    saving,
    uploadingImage,
    error,
    saveProfile,
    updateProfilePicture,
  } = useProfile();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    role: "",
    branch_store: "",
    email: "",
    phone_number: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(
    "https://i.pravatar.cc/300?img=12"
  );
  const [success, setSuccess] = useState("");

  const isProfileLocked = Boolean(profile?.is_profile_set);

  useEffect(() => {
    if (!profile) return;

    setForm({
      name: profile.name || profile.full_name || "",
      role: profile.role || profile.username || "",
      branch_store:
        profile.branch_store ||
        profile.branch ||
        profile.store_name ||
        profile.store ||
        profile.organization_name ||
        "",
      email: profile.email || "",
      phone_number:
        profile.phone_number || profile.phoneNumber || profile.phone || "",
    });

    setPreviewImage(
      profile.profile_image ||
        profile.avatar ||
        "https://i.pravatar.cc/300?img=12"
    );
  }, [profile]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (isProfileLocked) return;

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccess("");

    if (!file.type.startsWith("image/")) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);

    if (isProfileLocked) {
      await updateProfilePicture(file);
      setSuccess("Profile picture updated successfully.");
      return;
    }

    setSelectedImageFile(file);
  }

  async function handleSave() {
    try {
      setSuccess("");

      await saveProfile({
        name: form.name,
        phone: form.phone_number,
        phone_number: form.phone_number,
        image: selectedImageFile,
      });

      setSuccess("Profile updated successfully.");
    } catch {}
  }

  const editableInputClass =
    "h-[52px] w-full rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[15px] font-normal text-black outline-none shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition placeholder:text-[#9CA3AF] focus:border-[#0D4CBA] sm:text-[16px]";

  const readonlyInputClass =
    "h-[52px] w-full cursor-not-allowed rounded-[18px] border border-[#E5E7EB] bg-[#F9FAFB] px-5 text-[15px] font-normal text-[#6B7280] outline-none shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:text-[16px]";

  const inputClass = isProfileLocked ? readonlyInputClass : editableInputClass;

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full bg-[#F6F8FA] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex items-center gap-2 text-[15px] text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full ">
      <div className="mx-auto max-w-[1200px] px-0">
        <h2 className="mb-7 text-[22px] font-[600] tracking-[-0.03em] text-black sm:mb-8 sm:text-[24px]">
          My Profile
        </h2>

        <div className="mb-10 flex justify-center sm:mb-12 sm:justify-start">
          <div className="relative h-[116px] w-[116px] sm:h-[124px] sm:w-[124px]">
            <img
              src={previewImage}
              alt="profile"
              className="h-full w-full rounded-full border border-[#E5E7EB] object-cover shadow-[0_8px_22px_rgba(0,0,0,0.08)]"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute bottom-2 right-2 flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {uploadingImage ? (
                <Loader2 className="h-5 w-5 animate-spin text-black" />
              ) : (
                <Pencil className="h-5 w-5 text-black" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-6 sm:space-y-7">
          <ProfileInput
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            readOnly={isProfileLocked}
            className={inputClass}
          />

          <ProfileInput
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            readOnly
            className={readonlyInputClass}
          />

          <ProfileInput
            label="Branch / Store"
            name="branch_store"
            value={form.branch_store}
            onChange={handleChange}
            readOnly
            className={readonlyInputClass}
          />

          <ProfileInput
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            readOnly
            className={readonlyInputClass}
          />

          <ProfileInput
            label="Phone"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            readOnly={isProfileLocked}
            className={inputClass}
          />

          <button
            type="button"
            className="flex min-h-[82px] w-full items-center justify-between rounded-[18px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition hover:bg-[#F9FAFB] sm:px-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#F3F4F6] text-[18px] font-semibold text-black">
                **
              </div>

              <div className="text-left">
                <p className="text-[15px] font-medium text-black sm:text-[16px]">
                  Change Password
                </p>
                <span className="text-[12px] text-gray-400">
                  Last Change 27 Jan. 2026
                </span>
              </div>
            </div>

            <ArrowRight className="h-6 w-6 shrink-0 text-black sm:h-7 sm:w-7" />
          </button>
        </div>

        {error ? (
          <p className="mt-5 text-[14px] font-medium text-[#DC2626]">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="mt-5 text-[14px] font-medium text-[#16A34A]">
            {success}
          </p>
        ) : null}

        {!isProfileLocked ? (
          <div className="mt-10">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#0D4CBA] text-[16px] font-medium text-white shadow-[0_6px_14px_rgba(13,76,186,0.35)] transition hover:bg-[#0b42a0] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[230px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProfileInput({
  label,
  name,
  value,
  onChange,
  readOnly,
  className,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  className: string;
}) {
  return (
    <div>
      <label className="mb-3 block text-[15px] font-medium text-black sm:text-[16px]">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        className={className}
      />
    </div>
  );
}