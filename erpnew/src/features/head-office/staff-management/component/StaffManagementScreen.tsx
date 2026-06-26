"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarMinus,
  ChevronDown,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";

import AddEmployeeModal, { StaffRow } from "./AddEmployeeModal";
import {
  deleteStaff,
  getApiError,
  getStaffList,
} from "../api/staff-management-api";
import Pagination from "./Pagination";

const tableColumns = [
  { label: "Staff Name", width: 170, align: "left" },
  { label: "Email", width: 205, align: "left" },
  { label: "Contact No.", width: 150, align: "left" },
  { label: "Address", width: 230, align: "left" },
  { label: "Emp. ID", width: 125, align: "left" },
  { label: "Identity Proof", width: 145, align: "center" },
  { label: "Police Verified", width: 155, align: "center" },
  { label: "Role", width: 150, align: "center" },
  { label: "Branch", width: 175, align: "left" },
  { label: "Action", width: 105, align: "center" },
];

const tableMinWidth = tableColumns.reduce((sum, col) => sum + col.width, 0);

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeText(value: unknown, fallback = "N/A") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function formatRole(role: string) {
  return safeText(role)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name?: string) {
  const clean = safeText(name, "U").trim();
  const parts = clean.split(/\s+/).filter(Boolean);

  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function extractStaffList(res: any): any[] {
  const possibleLists = [
    res?.data?.users,
    res?.data?.staff,
    res?.data?.employees,
    res?.data?.rows,
    res?.data?.data,
    res?.users,
    res?.staff,
    res?.employees,
    res?.rows,
    res?.data,
  ];

  for (const list of possibleLists) {
    if (Array.isArray(list)) return list;
  }

  return [];
}

function normalizeEmployee(item: any): StaffRow {
  const id =
    item?.id ||
    item?._id ||
    item?.userId ||
    item?.user_id ||
    item?.employee_id ||
    item?.empId ||
    item?.userCode ||
    item?.user_code ||
    item?.email ||
    "";

  const organizationName =
    item?.branch ||
    item?.branch_name ||
    item?.storeName ||
    item?.store_name ||
    item?.store ||
    item?.organization_name ||
    item?.store_code ||
    "N/A";

  return {
    id: String(id),
    name: safeText(
      item?.name || item?.username || item?.fullName || item?.full_name,
      "N/A"
    ),
    email: safeText(item?.email),
    contact: safeText(
      item?.contact ||
      item?.phoneNumber ||
      item?.phone_number ||
      item?.mobile ||
      item?.phone
    ),
    role: safeText(item?.role || item?.designation),
    branch: safeText(organizationName),
    employeeId: safeText(
      item?.employeeId ||
      item?.employee_id ||
      item?.emp_id ||
      item?.userCode ||
      item?.user_code ||
      id
    ),
    address: safeText(item?.address),
    identityProof: safeText(
      item?.identityProof ||
      item?.identity_proof ||
      item?.identityProofUrl ||
      item?.identity_proof_url ||
      item?.aadhaarUrl ||
      item?.aadhaar_url,
      ""
    ),
    policeVerification: safeText(
      item?.policeVerification ||
      item?.police_verification ||
      item?.policeVerificationUrl ||
      item?.police_verification_url ||
      item?.policeDocUrl ||
      item?.police_doc_url,
      ""
    ),
    image: safeText(
      item?.image || item?.profileImage || item?.profile_image || item?.avatar,
      ""
    ),
    organization_id: item?.organization_id || item?.organizationId || "",
    organizationLevel: item?.organizationLevel || item?.organization_level || "",
  };
}

function TextCell({
  children,
  title,
  bold = false,
  center = false,
  twoLine = false,
}: {
  children: React.ReactNode;
  title?: string;
  bold?: boolean;
  center?: boolean;
  twoLine?: boolean;
}) {
  return (
    <div
      title={title || (typeof children === "string" ? children : undefined)}
      className={cn(
        "max-w-full text-[14px] leading-[18px] tracking-[-0.02em] text-erp-text-soft",
        bold && "font-semibold text-erp-text",
        center && "text-center",
        twoLine ? "line-clamp-2 break-words" : "truncate whitespace-nowrap"
      )}
    >
      {children}
    </div>
  );
}

function StaffAvatar({ row }: { row: StaffRow }) {
  if (row.image) {
    return (
      <img
        src={row.image}
        alt={row.name}
        className="h-[46px] w-[46px] shrink-0 rounded-erp-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-erp-full bg-[#E6EBF2] text-[13px] font-semibold uppercase text-erp-text-soft">
      {getInitials(row.name)}
    </div>
  );
}

function SummaryCards({
  stats,
}: {
  stats: StaffStats;
}) {
  const cards = [
    {
      label: "Total Staff",
      value: stats.total_staff,
      icon: Users,
      wrap: "bg-erp-primary-soft",
      iconColor: "text-erp-primary",
    },
    {
      label: "Active",
      value: stats.active,
      icon: UserCheck,
      wrap: "bg-erp-success-soft",
      iconColor: "text-erp-success",
    },
    {
      label: "On Leave",
      value: stats.on_leave,
      icon: CalendarMinus,
      wrap: "bg-[#FFF0D9]",
      iconColor: "text-[#FF6B00]",
    },
    {
      label: "Departments",
      value: stats.departments,
      icon: Users,
      wrap: "bg-erp-purple-soft",
      iconColor: "text-erp-purple",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="flex h-[110px] items-center gap-[10px] rounded-[24px] border border-erp-border bg-erp-card px-[14px] shadow-erp-card sm:gap-[14px] sm:px-[24px]"
          >
            <div
              className={cn(
                "flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[12px] sm:h-[54px] sm:w-[54px]",
                card.wrap
              )}
            >
              <Icon
                className={cn(
                  "h-[22px] w-[22px] stroke-[2.2] sm:h-[24px] sm:w-[24px]",
                  card.iconColor
                )}
              />
            </div>

            <div>
              <p className="text-sm font-[400] text-erp-muted">
                {card.label}
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Toolbar({
  search,
  setSearch,
  branches,
  selectedBranch,
  setSelectedBranch,
  onAdd,
}: {
  search: string;
  setSearch: (value: string) => void;
  branches: string[];
  selectedBranch: string;
  setSelectedBranch: (value: string) => void;
  onAdd: () => void;
}) {
  const [openBranch, setOpenBranch] = useState(false);
  const branchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (!branchRef.current) return;

      if (!branchRef.current.contains(event.target as Node)) {
        setOpenBranch(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <div className="rounded-[32px] border border-erp-border bg-erp-card px-3 py-3 shadow-erp-card  max-[768px]:px-[18px] max-[768px]:py-[17px]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-[760px] 2xl:max-w-[860px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#8C96A6] sm:left-[18px] sm:h-[18px] sm:w-[18px]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, employee ID....."
            className="h-[40px] w-full rounded-erp-full border-0 bg-[#F4F4F5] pl-[44px] pr-4 text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-erp-text outline-none transition placeholder:text-erp-muted focus:ring-2 focus:ring-erp-primary/10 sm:pl-[50px] sm:text-[15px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:flex-wrap xl:flex-nowrap xl:items-center xl:justify-end">
          <div ref={branchRef} className="relative min-w-0">
            <button
              type="button"
              onClick={() => setOpenBranch((prev) => !prev)}
              className="flex h-[40px] w-full items-center justify-between rounded-erp-full border border-erp-border bg-white px-4 text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-erp-text shadow-erp-sm transition hover:bg-erp-card-soft sm:min-w-[148px] sm:px-[22px] sm:text-[15px]"
            >
              <span className="min-w-0 max-w-full truncate sm:max-w-[120px]">
                {selectedBranch === "All" ? "Branch" : selectedBranch}
              </span>

              <ChevronDown
                className={cn(
                  "ml-2 h-[17px] w-[17px] shrink-0 stroke-[2.2] transition-transform sm:h-[18px] sm:w-[18px]",
                  openBranch && "rotate-180"
                )}
              />
            </button>

            {openBranch && (
              <div className="absolute left-0 right-auto z-40 mt-2 max-h-[280px] w-[calc(100vw-32px)] overflow-y-auto rounded-erp-md border border-erp-border bg-white shadow-erp-card sm:right-0 sm:left-auto sm:w-[240px]">
                {branches.map((branch) => {
                  const active = branch === selectedBranch;

                  return (
                    <button
                      key={branch}
                      type="button"
                      onClick={() => {
                        setSelectedBranch(branch);
                        setOpenBranch(false);
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left text-[14px] font-medium leading-[18px] tracking-[-0.02em] transition",
                        active
                          ? "bg-erp-dark text-white"
                          : "bg-white text-erp-text hover:bg-erp-card-soft"
                      )}
                    >
                      {branch === "All" ? "Branch" : branch}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="flex h-[40px] min-w-0 items-center justify-center gap-[6px] rounded-erp-full bg-erp-dark px-3 text-[14px] font-semibold leading-[20px] tracking-[-0.02em] text-white transition hover:brightness-110 sm:gap-[8px] sm:px-[22px] sm:text-[15px]"
          >
            <Plus className="h-[17px] w-[17px] shrink-0 stroke-[2.2] sm:h-[18px] sm:w-[18px]" />
            <span className="truncate whitespace-nowrap">Add Employee</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DesktopTable({
  rows,
  loading,
  refreshing,
  onEdit,
  onDelete,
}: {
  rows: StaffRow[];
  loading: boolean;
  refreshing: boolean;
  onEdit: (row: StaffRow) => void;
  onDelete: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const startDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input")
    ) {
      return;
    }

    if (!scrollRef.current) return;

    dragState.current = {
      isDown: true,
      startX: event.clientX,
      scrollLeft: scrollRef.current.scrollLeft,
      moved: false,
    };

    scrollRef.current.classList.add("cursor-grabbing");
    scrollRef.current.classList.remove("cursor-grab");
  };

  const moveDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.isDown || !scrollRef.current) return;

    event.preventDefault();

    const walk = event.clientX - dragState.current.startX;
    if (Math.abs(walk) > 4) dragState.current.moved = true;

    scrollRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const stopDrag = () => {
    if (scrollRef.current) {
      scrollRef.current.classList.remove("cursor-grabbing");
      scrollRef.current.classList.add("cursor-grab");
    }

    dragState.current.isDown = false;
  };

  return (
    <div className="hidden overflow-hidden rounded-[30px] border border-erp-border bg-erp-card shadow-erp-card lg:block">
      <div
        ref={scrollRef}
        className="table-drag-scroll cursor-grab overflow-x-auto select-none active:cursor-grabbing"
        onMouseDown={startDrag}
        onMouseMove={moveDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <table
          className="w-full table-fixed border-separate border-spacing-0"
          style={{ minWidth: `${tableMinWidth}px` }}
        >
          <colgroup>
            {tableColumns.map((column) => (
              <col
                key={column.label}
                style={{
                  width: `${column.width}px`,
                  minWidth: `${column.width}px`,
                }}
              />
            ))}
          </colgroup>

          <thead>
            <tr className="bg-black">
              {tableColumns.map((column, index) => (
                <th
                  key={column.label}
                  className={cn(
                    "h-[58px] border-r border-black px-5 text-[15px] font-semibold leading-none tracking-[-0.02em] text-white whitespace-nowrap",
                    column.align === "center" ? "text-center" : "text-left",
                    index === 0 && "rounded-tl-[30px]",
                    index === tableColumns.length - 1 &&
                    "rounded-tr-[30px] border-r-0"
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={tableColumns.length} className="h-[320px]">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-erp-muted" />
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="h-[240px] text-center text-[15px] font-medium text-erp-muted"
                >
                  No staff members found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white transition hover:bg-erp-card-soft"
                >
                  <td className="h-[54px] border-b border-r border-erp-border px-5">
                    <div className="flex min-w-0 items-center gap-[12px]">
                      <StaffAvatar row={row} />
                      <TextCell title={row.name} bold twoLine>
                        {row.name}
                      </TextCell>
                    </div>
                  </td>

                  <td className="h-[54px] border-b border-r border-erp-border px-5">
                    <TextCell title={row.email} twoLine>
                      {row.email}
                    </TextCell>
                  </td>

                  <td className="h-[54px] border-b border-r border-erp-border px-5">
                    <TextCell title={row.contact}>{row.contact}</TextCell>
                  </td>

                  <td className="h-[54px] border-b border-r border-erp-border px-5">
                    <TextCell title={row.address} twoLine>
                      {row.address}
                    </TextCell>
                  </td>

                  <td className="h-[54px] border-b border-r border-erp-border px-5">
                    <TextCell title={row.employeeId} twoLine>
                      {row.employeeId}
                    </TextCell>
                  </td>

                  <td className="h-[54px] border-b border-r border-erp-border px-5 text-center">
                    {row.identityProof ? (
                      <a
                        href={row.identityProof}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[14px] font-medium text-erp-primary underline underline-offset-2"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-[14px] text-erp-muted">N/A</span>
                    )}
                  </td>

                  <td className="h-[54px] border-b border-r border-erp-border px-5 text-center">
                    {row.policeVerification ? (
                      <a
                        href={row.policeVerification}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[14px] font-medium text-erp-primary underline underline-offset-2"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-[14px] text-erp-muted">N/A</span>
                    )}
                  </td>

                  <td className="h-[54px] border-b border-r border-erp-border px-5">
                    <TextCell title={row.role} center twoLine>
                      {formatRole(row.role)}
                    </TextCell>
                  </td>

                  <td className="h-[54px] border-b border-r border-erp-border px-5">
                    <TextCell title={row.branch} twoLine>
                      {row.branch}
                    </TextCell>
                  </td>

                  <td className="h-[54px] border-b border-erp-border px-5">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="text-erp-primary transition hover:text-erp-primary-hover"
                        title="Edit"
                      >
                        <Edit3 className="h-[18px] w-[18px] stroke-[2.1]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="text-erp-danger transition hover:opacity-75"
                        title="Delete"
                      >
                        <Trash2 className="h-[18px] w-[18px] stroke-[2.1]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {refreshing && !loading && (
          <div className="border-t border-erp-border py-2 text-center text-[13px] font-medium text-erp-muted">
            Refreshing...
          </div>
        )}
      </div>
    </div>
  );
}

function MobileCards({
  rows,
  loading,
  onEdit,
  onDelete,
}: {
  rows: StaffRow[];
  loading: boolean;
  onEdit: (row: StaffRow) => void;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="grid w-full gap-4 lg:hidden">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[230px] w-full animate-pulse rounded-[26px] border border-erp-border bg-erp-card shadow-erp-card"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full gap-4 lg:hidden">
      {rows.map((row) => (
        <article
          key={row.id}
          className="w-full overflow-hidden rounded-[26px] border border-erp-border bg-erp-card shadow-erp-card"
        >
          <div className="p-5">
            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <StaffAvatar row={row} />

                <div className="min-w-0 flex-1">
                  <h3 className="max-w-full truncate text-[18px] font-semibold leading-[23px] tracking-[-0.03em] text-erp-heading">
                    {row.name}
                  </h3>

                  <p className="mt-[4px] max-w-full break-all text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-erp-text-soft">
                    {row.email}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 pt-[2px]">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-erp-primary transition hover:bg-erp-primary-soft"
                  title="Edit"
                >
                  <Edit3 className="h-[17px] w-[17px] stroke-[2.1]" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-erp-danger transition hover:bg-erp-danger-soft"
                  title="Delete"
                >
                  <Trash2 className="h-[17px] w-[17px] stroke-[2.1]" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">
              <Info label="Contact" value={row.contact} />
              <Info label="Emp. ID" value={row.employeeId} />
              <Info label="Role" value={formatRole(row.role)} />
              <Info label="Branch" value={row.branch} />

              <div className="col-span-2">
                <Info label="Address" value={row.address} full />
              </div>
            </div>
          </div>

          {(row.identityProof || row.policeVerification) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-erp-border px-5 py-4">
              {row.identityProof ? (
                <a
                  href={row.identityProof}
                  target="_blank"
                  rel="noreferrer"
                  className="max-w-full truncate text-[15px] font-medium leading-[20px] tracking-[-0.02em] text-erp-primary underline underline-offset-2"
                >
                  Identity Proof
                </a>
              ) : null}

              {row.policeVerification ? (
                <a
                  href={row.policeVerification}
                  target="_blank"
                  rel="noreferrer"
                  className="max-w-full truncate text-[15px] font-medium leading-[20px] tracking-[-0.02em] text-erp-primary underline underline-offset-2"
                >
                  Police Verified
                </a>
              ) : null}
            </div>
          )}
        </article>
      ))}

      {!rows.length && (
        <div className="w-full rounded-[26px] border border-erp-border bg-erp-card p-8 text-center text-[14px] font-medium text-erp-muted shadow-erp-card">
          No staff members found.
        </div>
      )}
    </div>
  );
}

function Info({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={cn("min-w-0", full && "w-full")}>
      <p className="text-[15px] font-medium leading-[20px] tracking-[-0.02em] text-[#51627A]">
        {label}
      </p>

      <p
        title={value}
        className={cn(
          "mt-[6px] text-[15px] font-semibold leading-[21px] tracking-[-0.02em] text-black",
          full ? "break-words" : "truncate"
        )}
      >
        {value || "N/A"}
      </p>
    </div>
  );
}

export default function StaffManagementScreen() {
  type StaffStats = {
    total_staff: number;
    active: number;
    on_leave: number;
    departments: number;
  };

  const [stats, setStats] = useState<StaffStats>({
    total_staff: 0,
    active: 0,
    on_leave: 0,
    departments: 0,
  });
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 100,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<StaffRow | null>(null);

  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");

  async function fetchEmployees(keepOldData = false) {
    try {
      keepOldData
        ? setRefreshing(true)
        : setLoading(true);

      const res = await getStaffList({
        page,
        limit,
      });

      setStats({
        total_staff: Number(res?.stats?.total_staff || 0),
        active: Number(res?.stats?.active || 0),
        on_leave: Number(res?.stats?.on_leave || 0),
        departments: Number(res?.stats?.departments || 0),
      });
      setPagination({
        total: Number(
          res?.pagination?.total ??
          res?.meta?.total ??
          0
        ),
        totalPages: Number(
          res?.pagination?.totalPages ??
          res?.meta?.totalPages ??
          1
        ),
        page: Number(
          res?.pagination?.page ??
          res?.meta?.page ??
          page
        ),
        limit: Number(
          res?.pagination?.limit ??
          res?.meta?.limit ??
          limit
        ),
      });

      const list = extractStaffList(res);

      setRows(
        list
          .map(normalizeEmployee)
          .filter((item) => item.id)
      );
    } catch (err) {
      console.error(
        "STAFF LIST ERROR:",
        getApiError(err)
      );

      if (!keepOldData) {
        setRows([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchEmployees(false);
  }, [page]);

  async function handleDelete(id: string) {
    if (!confirm("Delete employee?")) return;

    try {
      await deleteStaff(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      alert(getApiError(err));
    }
  }

  const branches = useMemo(() => {
    const unique = Array.from(new Set(rows.map((row) => row.branch))).filter(
      Boolean
    );

    return ["All", ...unique];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const branchMatch =
        selectedBranch === "All" || row.branch === selectedBranch;

      if (!branchMatch) return false;
      if (!query) return true;

      return [
        row.name,
        row.email,
        row.contact,
        row.employeeId,
        row.role,
        row.branch,
        row.address,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [rows, search, selectedBranch]);

  return (
    <>
      <main className="w-full max-w-full overflow-hidden">
        <section className="w-full max-w-full space-y-6 overflow-hidden">
          <div>
            <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.04em] text-erp-heading sm:text-[34px] sm:leading-[42px]">
              Staff Management
            </h1>
            <p className="mt-[2px] text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-erp-muted sm:text-[18px] sm:leading-[24px]">
              Manage your store team members
            </p>
          </div>

          <SummaryCards stats={stats} />

          <Toolbar
            search={search}
            setSearch={setSearch}
            branches={branches}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            onAdd={() => {
              setEditRow(null);
              setModalOpen(true);
            }}
          />

          <DesktopTable
            rows={filteredRows}
            loading={loading}
            refreshing={refreshing}
            onEdit={(row) => {
              setEditRow(row);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />

          <MobileCards
            rows={filteredRows}
            loading={loading}
            onEdit={(row) => {
              setEditRow(row);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />

          <div className="mt-6">
            <Pagination
            currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={setPage} />
          </div>
        </section>
      </main>

      <AddEmployeeModal
        open={modalOpen}
        editRow={editRow}
        onClose={() => {
          setModalOpen(false);
          setEditRow(null);
        }}
        onSuccess={() => fetchEmployees(true)}
      />
    </>
  );
}