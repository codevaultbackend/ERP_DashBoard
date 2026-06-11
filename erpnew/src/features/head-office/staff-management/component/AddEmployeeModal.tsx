"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Upload, X } from "lucide-react";
import {
  addEmployee,
  updateEmployee,
  getOrganizationsByLevel,
  type Organization,
  type OrganizationLevel,
} from "../api/staff-management-api";

export type StaffRow = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  contact?: string;
  phoneNumber?: string;
  role?: string;
  branch?: string;
  employeeId?: string;
  address?: string;
  identityProof?: string;
  policeVerification?: string;
  image?: string;
  organization_id?: string | number;
  organizationLevel?: string;
};

type Props = {
  open: boolean;
  editRow?: StaffRow | null;
  onClose: () => void;
  onSuccess: () => void;
};

const LEVEL_OPTIONS: { label: string; value: OrganizationLevel }[] = [
  { label: "Retail", value: "retail" },
  { label: "District", value: "district" },
  { label: "Head", value: "head" },
];

const ROLE_OPTIONS: Record<OrganizationLevel, string[]> = {
  retail: ["Retail-Manager", "Retail-TL"],
  district: ["District-TL", "District-Manager"],
  head: ["Super-Admin"],
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalizeLevel(value?: string): OrganizationLevel {
  const v = String(value || "").toLowerCase();

  if (v.includes("district")) return "district";
  if (v.includes("head")) return "head";

  return "retail";
}

function getOrganizationName(item: Organization) {
  return (
    item.store_name ||
    item.name ||
    item.organization_name ||
    item.store_code ||
    `Organization ${item.id}`
  );
}

export default function AddEmployeeModal({
  open,
  editRow,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = Boolean(editRow?.id);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    phoneNumber: "",
    address: "",
    organizationLevel: "retail" as OrganizationLevel,
    organization_id: "",


    profileImage: null as File | null,

    aadhaar: null as File | null,
    pan: null as File | null,
    policeDoc: null as File | null,
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedLevelLabel = useMemo(() => {
    return (
      LEVEL_OPTIONS.find((item) => item.value === form.organizationLevel)
        ?.label || "Retail"
    );
  }, [form.organizationLevel]);

  const organizationLabel =
    selectedLevelLabel === "Retail"
      ? "Store List"
      : selectedLevelLabel === "District"
        ? "District List"
        : "Head Office List";

  useEffect(() => {
    if (!open) return;

    console.log("EDIT ROW:", editRow);

    const level = normalizeLevel(
      editRow?.organizationLevel
    );

    setForm({
      username:
        editRow?.username ||
        editRow?.name ||
        "",
      email: editRow?.email || "",
      password: "",
      role: editRow?.role || "",
      phoneNumber:
        editRow?.contact ||
        editRow?.phoneNumber ||
        "",
      address: editRow?.address || "",
      organizationLevel: level,
      organization_id:
        editRow?.organization_id != null
          ? String(editRow.organization_id)
          : "",
      aadhaar: null,
      pan: null,
      policeDoc: null,
    });
  }, [open, editRow]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadOrganizations() {
      try {
        setLoadingOrganizations(true);

        const list = await getOrganizationsByLevel(form.organizationLevel);

        if (!active) return;

        setOrganizations(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("ORGANIZATION LOAD ERROR:", err);

        if (!active) return;

        setOrganizations([]);
      } finally {
        if (active) setLoadingOrganizations(false);
      }
    }

    loadOrganizations();

    return () => {
      active = false;
    };
  }, [open, form.organizationLevel]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, submitting, onClose]);

  async function handleSubmit() {
    try {
      const username = form.username.trim();
      const email = form.email.trim();
      const password = form.password.trim();
      const phoneNumber = form.phoneNumber.trim();
      const address = form.address.trim();

      if (!isEdit) {
        if (!username) return alert("Name is required");
        if (!email) return alert("Email is required");
        if (!password) return alert("Password is required");
        if (!form.role) return alert("Role is required");

        if (!form.organization_id) {
          return alert(`${selectedLevelLabel} is required`);
        }
      }



      setSubmitting(true);

      const payload: any = {};

      if (username !== (editRow?.username || editRow?.name || ""))
        payload.username = username;

      if (email !== (editRow?.email || ""))
        payload.email = email;

      if (password)
        payload.password = password;

      if (form.role !== (editRow?.role || ""))
        payload.role = form.role;

      if (
        phoneNumber !==
        (editRow?.phoneNumber || editRow?.contact || "")
      )
        payload.phoneNumber = phoneNumber;

      if (address !== (editRow?.address || ""))
        payload.address = address;

      if (
        String(form.organization_id) !==
        String(editRow?.organization_id || "")
      )
        payload.organization_id = form.organization_id;

      if (form.aadhaar)
        payload.aadhaar = form.aadhaar;

      if (form.pan)
        payload.pan = form.pan;

      if (form.policeDoc)
        payload.policeDoc = form.policeDoc;


      if (isEdit && editRow?.id) {
        await updateEmployee(editRow.id, payload);
      } else {
        await addEmployee({
          username,
          email,
          password,
          role: form.role,
          phoneNumber,
          address,
          organization_id: form.organization_id,
          aadhaar: form.aadhaar,
          pan: form.pan,
          policeDoc: form.policeDoc,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("EMPLOYEE SAVE ERROR:", err?.response?.data || err);

      alert(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to save employee"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/35 px-3 py-4 backdrop-blur-[1px]">
      <div className="relative flex max-h-[calc(100vh-28px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] bg-erp-card px-4 pb-4 pt-5 shadow-[0_16px_38px_rgba(0,0,0,0.28)] sm:rounded-[32px] sm:px-7 sm:pb-7 sm:pt-6">
        <div className="mb-4 flex shrink-0 items-center justify-between sm:mb-6">
          <h2 className="text-[20px] font-semibold leading-[26px] tracking-[-0.04em] text-erp-heading sm:text-[22px] sm:leading-[28px]">
            {isEdit ? "Edit Employee" : "Add New Employee"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-8 w-8 items-center justify-center rounded-erp-full text-erp-text-soft transition hover:bg-erp-card-soft disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="rounded-[24px] bg-[#F8FAFC] px-4 py-4 sm:px-5 sm:py-5">
            <h3 className="mb-5 text-[18px] font-semibold leading-[24px] tracking-[-0.035em] text-erp-heading">
              Employee Details
            </h3>

            <div className="space-y-5">

              <Field
                label="Name"
                value={form.username}
                disabled={submitting}
                onChange={(value) =>
                  setForm({ ...form, username: value })
                }
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <SelectField
                  label="Role"
                  value={form.role}
                  disabled={submitting}
                  onChange={(value) =>
                    setForm({ ...form, role: value })
                  }
                >
                  <option value="">Select Role</option>

                  {ROLE_OPTIONS[
                    form.organizationLevel
                  ].map((role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role.replaceAll("_", " ")}
                    </option>
                  ))}
                </SelectField>

                <ImageUploadField
                  label="Upload Image"
                  imageUrl={editRow?.image}
                  file={form.profileImage}
                  onChange={(file) =>
                    setForm({
                      ...form,
                      profileImage: file,
                    })
                  }
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Email"
                  value={form.email}
                  type="email"
                  disabled={submitting || isEdit}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      email: value,
                    })
                  }
                />

                <Field
                  label="Contact No."
                  value={form.phoneNumber}
                  disabled={submitting}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      phoneNumber: value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                />
              </div>

              <Field
                label="Address"
                value={form.address}
                disabled={submitting}
                onChange={(value) =>
                  setForm({
                    ...form,
                    address: value,
                  })
                }
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <SelectField
                  label="Level"
                  value={form.organizationLevel}
                  disabled={submitting}
                  onChange={(value) => {
                    const nextLevel =
                      value as OrganizationLevel;

                    setForm({
                      ...form,
                      organizationLevel: nextLevel,
                      role: "",
                      organization_id: "",
                    });
                  }}
                >
                  {LEVEL_OPTIONS.map((level) => (
                    <option
                      key={level.value}
                      value={level.value}
                    >
                      {level.label}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label={organizationLabel}
                  value={form.organization_id}
                  disabled={
                    submitting ||
                    loadingOrganizations
                  }
                  onChange={(value) => {
                    const selected =
                      organizations.find(
                        (item) =>
                          String(item.id) === value
                      );

                    setForm({
                      ...form,
                      organization_id: value,
                      address:
                        selected?.address ||
                        form.address,
                    });
                  }}
                >
                  <option value="">
                    Select
                  </option>

                  {organizations.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {getOrganizationName(item)}
                    </option>
                  ))}
                </SelectField>
              </div>

              {!isEdit && (
                <Field
                  label="Password"
                  value={form.password}
                  type="password"
                  disabled={submitting}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      password: value,
                    })
                  }
                />
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <FileButton
                  label="Upload Identity"
                  value={form.aadhaar}
                  disabled={submitting}
                  onChange={(file) =>
                    setForm({
                      ...form,
                      aadhaar: file,
                    })
                  }
                />

                <FileButton
                  label="PAN Card"
                  value={form.pan}
                  disabled={submitting}
                  onChange={(file) =>
                    setForm({
                      ...form,
                      pan: file,
                    })
                  }
                />

                <FileButton
                  label="Police Verification"
                  value={form.policeDoc}
                  disabled={submitting}
                  onChange={(file) =>
                    setForm({
                      ...form,
                      policeDoc: file,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-[40px] rounded-[10px] border border-erp-border bg-white text-[15px] font-medium text-erp-text shadow-erp-sm transition hover:bg-erp-card-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex h-[40px] items-center justify-center gap-2 rounded-[10px] bg-erp-dark text-[15px] font-semibold text-white shadow-erp-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isEdit ? (
              "Update Employee"
            ) : (
              "Add Employee"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium leading-none text-erp-text sm:text-[15px]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-[40px] w-full rounded-[11px] border-0 bg-[#F1F3F6] px-4 text-[14px] text-erp-text outline-none transition placeholder:text-erp-placeholder focus:ring-2 focus:ring-erp-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled = false,
  rightIcon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium leading-none text-erp-text sm:text-[15px]">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-[40px] w-full appearance-none rounded-[11px] border-0 bg-[#F1F3F6] px-4 pr-10 text-[14px] text-erp-text outline-none transition focus:ring-2 focus:ring-erp-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {children}
        </select>

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {rightIcon || (
            <ChevronDown className="h-4 w-4 text-erp-text-soft" />
          )}
        </div>
      </div>
    </label>
  );
}
function ImageUploadField({
  label,
  file,
  imageUrl,
  onChange,
  disabled,
}: {
  label: string;
  file: File | null;
  imageUrl?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const preview =
    file
      ? URL.createObjectURL(file)
      : imageUrl;

  return (
    <div>
      <label className="mb-2 block text-[14px] font-medium">
        {label}
      </label>

      <label className="flex h-[48px] cursor-pointer items-center gap-3 rounded-[11px] bg-[#F1F3F6] px-3">

        {preview ? (
          <img
            src={preview}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <Upload className="h-4 w-4" />
        )}

        <span className="truncate text-[14px]">
          {file
            ? file.name
            : "Choose Image"}
        </span>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={(e) =>
            onChange(
              e.target.files?.[0] || null
            )
          }
        />
      </label>
    </div>
  );
}

function FileButton({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-medium leading-none text-erp-text sm:text-[15px]">
        {label}
      </label>

      <label
        className={cn(
          "relative flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-[10px] px-3 text-[14px] font-medium transition sm:text-[15px]",
          value
            ? "bg-erp-success-soft text-erp-success"
            : "bg-[#F1F3F6] text-erp-text-soft hover:bg-[#ECEFF3]",
          disabled && "cursor-not-allowed opacity-70"
        )}
      >
        <Upload className="h-4 w-4 shrink-0" strokeWidth={1.9} />
        <span className="truncate">{value ? value.name : "Document"}</span>

        <input
          type="file"
          disabled={disabled}
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}