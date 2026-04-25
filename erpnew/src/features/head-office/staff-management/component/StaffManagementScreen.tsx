"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgePlus,
  ChevronDown,
  Pencil,
  Search,
  ShieldAlert,
  Trash2,
  Upload,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";

type StaffRow = {
  id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  employeeId: string;
  role: string;
  branch: string;
  identityProof?: string;
  policeVerification?: string;
  image?: string;
};

type StaffForm = {
  name: string;
  email: string;
  contact: string;
  address: string;
  employeeId: string;
  role: string;
  branch: string;
  identityProof: string;
  policeVerification: string;
  image: string;
};

const initialRows: StaffRow[] = [
  {
    id: "1",
    name: "John Dae",
    email: "john.dae@gmail.com",
    contact: "98675 24589",
    address: "Flat 302, Maple Residency, Whitefield",
    employeeId: "EMP1234",
    role: "Manager",
    branch: "Karnal District",
    identityProof: "aadhaar_john.pdf",
    policeVerification: "police_john.pdf",
  },
  {
    id: "2",
    name: "John Dae",
    email: "john.dae@gmail.com",
    contact: "98675 24589",
    address: "Flat 302, Maple Residency, Whitefield",
    employeeId: "EMP2234",
    role: "Sales",
    branch: "Model Town Store",
    identityProof: "aadhaar_2.pdf",
    policeVerification: "police_2.pdf",
  },
  {
    id: "3",
    name: "John Dae",
    email: "john.dae@gmail.com",
    contact: "98675 24589",
    address: "Flat 302, Maple Residency, Whitefield",
    employeeId: "EMP3234",
    role: "Sales",
    branch: "Model Town Store",
    identityProof: "aadhaar_3.pdf",
    policeVerification: "police_3.pdf",
  },
  {
    id: "4",
    name: "John Dae",
    email: "john.dae@gmail.com",
    contact: "98675 24589",
    address: "Flat 302, Maple Residency, Whitefield",
    employeeId: "EMP4234",
    role: "Security Guard",
    branch: "Karnal District",
    identityProof: "aadhaar_4.pdf",
    policeVerification: "police_4.pdf",
  },
  {
    id: "5",
    name: "John Dae",
    email: "john.dae@gmail.com",
    contact: "98675 24589",
    address: "Flat 302, Maple Residency, Whitefield",
    employeeId: "EMP5234",
    role: "Security Guard",
    branch: "Model Town Store",
    identityProof: "aadhaar_5.pdf",
    policeVerification: "police_5.pdf",
  },
  {
    id: "6",
    name: "John Dae",
    email: "john.dae@gmail.com",
    contact: "98675 24589",
    address: "Flat 302, Maple Residency, Whitefield",
    employeeId: "EMP6234",
    role: "Security Guard",
    branch: "Model Town Store",
    identityProof: "aadhaar_6.pdf",
    policeVerification: "police_6.pdf",
  },
];

const roleOptions = ["Manager", "Sales", "Security Guard", "Cashier", "HR"];
const branchOptions = ["All Branches", "Karnal District", "Model Town Store"];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function emptyForm(): StaffForm {
  return {
    name: "",
    email: "",
    contact: "",
    address: "",
    employeeId: "",
    role: "",
    branch: "",
    identityProof: "",
    policeVerification: "",
    image: "",
  };
}

function formFromRow(row: StaffRow): StaffForm {
  return {
    name: row.name,
    email: row.email,
    contact: row.contact,
    address: row.address,
    employeeId: row.employeeId,
    role: row.role,
    branch: row.branch,
    identityProof: row.identityProof || "",
    policeVerification: row.policeVerification || "",
    image: row.image || "",
  };
}

function toRow(form: StaffForm, id: string): StaffRow {
  return {
    id,
    name: form.name.trim(),
    email: form.email.trim(),
    contact: form.contact.trim(),
    address: form.address.trim(),
    employeeId: form.employeeId.trim(),
    role: form.role.trim(),
    branch: form.branch.trim(),
    identityProof: form.identityProof.trim(),
    policeVerification: form.policeVerification.trim(),
    image: form.image.trim(),
  };
}

function validateForm(form: StaffForm) {
  const errors: Partial<Record<keyof StaffForm, string>> = {};

  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email";
  if (!form.contact.trim()) errors.contact = "Contact number is required";
  if (!form.employeeId.trim()) errors.employeeId = "Employee ID is required";
  if (!form.role.trim()) errors.role = "Role is required";
  if (!form.branch.trim()) errors.branch = "Branch is required";
  if (!form.address.trim()) errors.address = "Address is required";

  return errors;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  iconWrap,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconWrap: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-[0px_4px_14px_rgba(15,23,42,0.035)] sm:rounded-[28px] sm:px-6 sm:py-6">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-[48px] w-[48px] items-center justify-center rounded-[16px] sm:h-[52px] sm:w-[52px]",
            iconWrap
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>

        <div>
          <p className="text-[15px] font-medium text-[#5B6472] sm:text-[16px]">
            {title}
          </p>
          <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[24px]">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium text-[#202020] sm:text-[15px]">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-[44px] w-full rounded-[12px] border bg-[#F6F6F8] px-4 text-[14px] text-[#111827] outline-none transition",
          error ? "border-[#EF4444]" : "border-[#F0F1F3] focus:border-[#CBD5E1]"
        )}
      />
      {error ? <p className="mt-1 text-[12px] text-[#EF4444]">{error}</p> : null}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium text-[#202020] sm:text-[15px]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={cn(
          "w-full resize-none rounded-[12px] border bg-[#F6F6F8] px-4 py-3 text-[14px] text-[#111827] outline-none transition",
          error ? "border-[#EF4444]" : "border-[#F0F1F3] focus:border-[#CBD5E1]"
        )}
      />
      {error ? <p className="mt-1 text-[12px] text-[#EF4444]">{error}</p> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium text-[#202020] sm:text-[15px]">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-[44px] w-full appearance-none rounded-[12px] border bg-[#F6F6F8] px-4 text-[14px] text-[#111827] outline-none transition",
            error ? "border-[#EF4444]" : "border-[#F0F1F3] focus:border-[#CBD5E1]"
          )}
        >
          <option value="">Select</option>
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
      </div>
      {error ? <p className="mt-1 text-[12px] text-[#EF4444]">{error}</p> : null}
    </label>
  );
}

function UploadField({
  label,
  value,
  onFileChange,
}: {
  label: string;
  value: string;
  onFileChange: (fileName: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[14px] font-medium text-[#202020] sm:text-[15px]">
        {label}
      </p>

      <label className="flex h-[44px] w-full cursor-pointer items-center justify-center gap-3 rounded-[12px] border border-[#F0F1F3] bg-[#F6F6F8] px-4 text-[14px] font-medium text-[#444]">
        <Upload className="h-4 w-4" />
        <span className="max-w-[180px] truncate">
          {value || "Document"}
        </span>
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            onFileChange(file?.name || "");
          }}
        />
      </label>
    </div>
  );
}

function EmployeeModal({
  open,
  mode,
  form,
  setForm,
  errors,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  form: StaffForm;
  setForm: React.Dispatch<React.SetStateAction<StaffForm>>;
  errors: Partial<Record<keyof StaffForm, string>>;
  onClose: () => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,23,42,0.18)] px-3 py-4 backdrop-blur-[2px] sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        className="max-h-[95vh] w-full max-w-[560px] overflow-y-auto rounded-[28px] border border-[#E7E7E7] bg-white p-5 shadow-[0px_18px_40px_rgba(15,23,42,0.14)] sm:rounded-[34px] sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#111827] sm:text-[24px]">
            {mode === "add" ? "Add New Employee" : "Edit Employee"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[#444] transition hover:bg-[#F3F4F6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-[22px] bg-[#F8F8F9] p-4 sm:rounded-[28px] sm:p-6">
          <h3 className="mb-4 text-[16px] font-semibold text-[#111827]">
            Employee Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Name"
              value={form.name}
              onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
              error={errors.name}
            />

            <InputField
              label="Upload Image"
              value={form.image}
              onChange={(value) => setForm((prev) => ({ ...prev, image: value }))}
              placeholder="Image URL or file name"
            />

            <SelectField
              label="Role"
              value={form.role}
              onChange={(value) => setForm((prev) => ({ ...prev, role: value }))}
              options={roleOptions}
              error={errors.role}
            />

            <InputField
              label="Email"
              value={form.email}
              onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
              error={errors.email}
            />

            <InputField
              label="Contact No."
              value={form.contact}
              onChange={(value) => setForm((prev) => ({ ...prev, contact: value }))}
              error={errors.contact}
            />

            <InputField
              label="Employee ID"
              value={form.employeeId}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, employeeId: value }))
              }
              error={errors.employeeId}
            />
          </div>

          <div className="mt-4">
            <TextAreaField
              label="Address"
              value={form.address}
              onChange={(value) => setForm((prev) => ({ ...prev, address: value }))}
              error={errors.address}
            />
          </div>

          <div className="mt-4">
            <SelectField
              label="Branch/Store"
              value={form.branch}
              onChange={(value) => setForm((prev) => ({ ...prev, branch: value }))}
              options={branchOptions.filter((item) => item !== "All Branches")}
              error={errors.branch}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UploadField
              label="Upload identity"
              value={form.identityProof}
              onFileChange={(fileName) =>
                setForm((prev) => ({ ...prev, identityProof: fileName }))
              }
            />

            <UploadField
              label="Upload Police Verification"
              value={form.policeVerification}
              onFileChange={(fileName) =>
                setForm((prev) => ({ ...prev, policeVerification: fileName }))
              }
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] rounded-[14px] border border-[#E5E7EB] bg-white text-[16px] font-medium text-[#111827]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="h-[48px] rounded-[14px] bg-[#030521] text-[16px] font-medium text-white shadow-[0px_10px_18px_rgba(3,5,33,0.14)]"
          >
            {mode === "add" ? "Add Employee" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileEmployeeCard({
  row,
  onEdit,
  onDelete,
}: {
  row: StaffRow;
  onEdit: (row: StaffRow) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-4 shadow-[0px_4px_14px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#E5E7EB] text-[13px] font-semibold text-[#111827]">
            {getInitials(row.name)}
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#111827]">{row.name}</h3>
            <p className="text-[13px] text-[#6B7280]">{row.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onEdit(row)} className="text-[#3B82F6]">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row.id)}
            className="text-[#FF3B30]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-[13px] text-[#52525B]">
        <p><span className="font-medium text-[#111827]">Email:</span> {row.email}</p>
        <p><span className="font-medium text-[#111827]">Contact:</span> {row.contact}</p>
        <p><span className="font-medium text-[#111827]">Emp. ID:</span> {row.employeeId}</p>
        <p><span className="font-medium text-[#111827]">Branch:</span> {row.branch}</p>
        <p><span className="font-medium text-[#111827]">Address:</span> {row.address}</p>
      </div>

      <div className="mt-4 flex gap-6 text-[13px]">
        <button type="button" className="font-medium text-[#3B82F6] underline underline-offset-2">
          Identity Proof
        </button>
        <button type="button" className="font-medium text-[#3B82F6] underline underline-offset-2">
          Police Verified
        </button>
      </div>
    </div>
  );
}

export default function StaffManagementScreen() {
  const [rows, setRows] = useState<StaffRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("All Branches");
  const [openBranchMenu, setOpenBranchMenu] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof StaffForm, string>>>(
    {}
  );

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        row.name.toLowerCase().includes(term) ||
        row.employeeId.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term) ||
        row.role.toLowerCase().includes(term);

      const matchesBranch =
        branch === "All Branches" || row.branch.toLowerCase() === branch.toLowerCase();

      return matchesSearch && matchesBranch;
    });
  }, [rows, search, branch]);

  const totalStaff = rows.length;
  const activeStaff = rows.filter((row) => row.role !== "On Leave").length;
  const onLeave = Math.max(totalStaff - activeStaff, 1);
  const departments = new Set(rows.map((row) => row.role)).size;

  const stats = [
    {
      title: "Total Staff",
      value: String(totalStaff),
      icon: Users,
      iconWrap: "bg-[#DCEBFF]",
      iconColor: "text-[#246BFD]",
    },
    {
      title: "Active",
      value: String(activeStaff),
      icon: UserCheck,
      iconWrap: "bg-[#DDF8E6]",
      iconColor: "text-[#16A34A]",
    },
    {
      title: "On Leave",
      value: String(onLeave),
      icon: UserMinus,
      iconWrap: "bg-[#FFE8C7]",
      iconColor: "text-[#F97316]",
    },
    {
      title: "Departments",
      value: String(departments),
      icon: ShieldAlert,
      iconWrap: "bg-[#F0DFFF]",
      iconColor: "text-[#A855F7]",
    },
  ];

  const openAddModal = () => {
    setModalMode("add");
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (row: StaffRow) => {
    setModalMode("edit");
    setEditingId(row.id);
    setForm(formFromRow(row));
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setErrors({});
  };

  const handleSubmit = () => {
    const validation = validateForm(form);
    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    if (modalMode === "add") {
      const newRow = toRow(form, String(Date.now()));
      setRows((prev) => [newRow, ...prev]);
    } else if (editingId) {
      setRows((prev) =>
        prev.map((row) => (row.id === editingId ? toRow(form, editingId) : row))
      );
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <>
      <main className="min-h-screen w-full bg-[#F3F4F6]">
        <div className="mb-7">
          <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[38px] xl:text-[46px]">
            Staff Management
          </h1>
          <p className="mt-1 text-[15px] text-[#556070] sm:text-[18px]">
            Manage your store team members
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {stats.map((item) => (
            <StatsCard key={item.title} {...item} />
          ))}
        </section>

        <section className="mt-7 rounded-[24px] border border-[#E5E7EB] bg-white p-3 shadow-[0px_4px_14px_rgba(15,23,42,0.03)] sm:rounded-[32px] sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex h-[54px] flex-1 items-center rounded-[18px] bg-[#F7F7F8] px-4 sm:h-[58px] sm:rounded-[20px] sm:px-5">
              <Search className="mr-3 h-5 w-5 text-[#98A2B3]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search by name, employee ID....."
                className="h-full w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#8A94A6] sm:text-[16px]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:ml-auto">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenBranchMenu((prev) => !prev)}
                  className="flex h-[54px] min-w-[160px] items-center justify-center gap-3 rounded-[18px] border border-[#E5E7EB] bg-white px-5 text-[15px] font-medium text-[#111827] sm:h-[58px] sm:rounded-[20px] sm:text-[16px]"
                >
                  <span>{branch === "All Branches" ? "Branch" : branch}</span>
                  <ChevronDown className="h-5 w-5" />
                </button>

                {openBranchMenu ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-full overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0px_12px_24px_rgba(15,23,42,0.08)]">
                    {branchOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setBranch(option);
                          setOpenBranchMenu(false);
                        }}
                        className="block w-full px-4 py-3 text-left text-[14px] text-[#111827] hover:bg-[#F8FAFC]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="flex h-[54px] min-w-[180px] items-center justify-center gap-3 rounded-[18px] bg-[#030521] px-6 text-[15px] font-medium text-white shadow-[0px_10px_18px_rgba(3,5,33,0.14)] sm:h-[58px] sm:min-w-[192px] sm:rounded-[20px] sm:text-[16px]"
              >
                <BadgePlus className="h-5 w-5" />
                <span>Add Employee</span>
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 hidden overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0px_4px_14px_rgba(15,23,42,0.035)] lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-[1360px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-black">
                  {[
                    "Staff Name",
                    "Email",
                    "Contact No.",
                    "Address",
                    "Emp. ID",
                    "Identity Proof",
                    "Police Verified",
                    "Role",
                    "Branch",
                    "Action",
                  ].map((header, index, arr) => (
                    <th
                      key={header}
                      className={cn(
                        "px-6 py-5 text-left text-[15px] font-semibold text-white",
                        index === 0 && "rounded-tl-[32px]",
                        index === arr.length - 1 && "rounded-tr-[32px]"
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="bg-white">
                    <td className="border-b border-r border-[#EAECEF] px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#E5E7EB] text-[12px] font-semibold text-[#111827]">
                          {getInitials(row.name)}
                        </div>
                        <span className="text-[15px] font-medium text-[#111827]">
                          {row.name}
                        </span>
                      </div>
                    </td>

                    <td className="border-b border-r border-[#EAECEF] px-5 py-4 text-[15px] text-[#52525B]">
                      {row.email}
                    </td>

                    <td className="border-b border-r border-[#EAECEF] px-5 py-4 text-[15px] text-[#52525B]">
                      {row.contact}
                    </td>

                    <td className="max-w-[220px] border-b border-r border-[#EAECEF] px-5 py-4 text-[15px] leading-[1.35] text-[#52525B]">
                      {row.address}
                    </td>

                    <td className="border-b border-r border-[#EAECEF] px-5 py-4 text-[15px] text-[#52525B]">
                      {row.employeeId}
                    </td>

                    <td className="border-b border-r border-[#EAECEF] px-5 py-4 text-center">
                      <button
                        type="button"
                        className="text-[15px] font-medium text-[#3B82F6] underline underline-offset-2"
                      >
                        View
                      </button>
                    </td>

                    <td className="border-b border-r border-[#EAECEF] px-5 py-4 text-center">
                      <button
                        type="button"
                        className="text-[15px] font-medium text-[#3B82F6] underline underline-offset-2"
                      >
                        View
                      </button>
                    </td>

                    <td className="border-b border-r border-[#EAECEF] px-5 py-4 text-[15px] text-[#52525B]">
                      {row.role}
                    </td>

                    <td className="max-w-[180px] border-b border-r border-[#EAECEF] px-5 py-4 text-[15px] leading-[1.35] text-[#52525B]">
                      {row.branch}
                    </td>

                    <td className="border-b border-[#EAECEF] px-5 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => openEditModal(row)}
                          className="text-[#3B82F6] transition hover:scale-105"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="text-[#FF3B30] transition hover:scale-105"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-10 text-center text-[15px] text-[#6B7280]"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:hidden">
          {filteredRows.length > 0 ? (
            filteredRows.map((row) => (
              <MobileEmployeeCard
                key={row.id}
                row={row}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-6 text-center text-[14px] text-[#6B7280]">
              No employees found.
            </div>
          )}
        </section>
      </main>

      <EmployeeModal
        open={modalOpen}
        mode={modalMode}
        form={form}
        setForm={setForm}
        errors={errors}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}