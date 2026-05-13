"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Store,
  TrendingUp,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createHeadStore,
  getStoreDashboard,
  mapStoresToDistrict,
  type CreateStorePayload,
  type DashboardStore,
} from "@/features/head-office/store-management/api/store-management-api";

type DistrictStore = {
  id: string;
  name: string;
  code: string;
  level?: string;
};

type StoreForm = CreateStorePayload;

const initialForm: StoreForm = {
  store_name: "",
  level: "District",
  address: "",
  pincode: "",
  store_code: "",
};

const LEVEL_OPTIONS = ["Head", "District", "Retail"];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function HeadOfficeStoreManagementPage() {
  const [stores, setStores] = useState<DistrictStore[]>([]);
  const [mappableStores, setMappableStores] = useState<DistrictStore[]>([]);
  const [summary, setSummary] = useState({
    totalStores: 0,
    activeStores: 0,
    totalEmployees: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const res = await getStoreDashboard();
      const data = res?.data || {};
      const summaryData = data?.summary || {};

      setSummary({
        totalStores: Number(
          summaryData.totalStores || summaryData.total_stores || 0
        ),
        activeStores: Number(
          summaryData.activeStores || summaryData.active_stores || 0
        ),
        totalEmployees: Number(
          summaryData.totalEmployees || summaryData.total_employees || 0
        ),
        totalRevenue: Number(
          summaryData.totalRevenue || summaryData.total_revenue || 0
        ),
      });

      const districts = normalizeStores(
        data?.districts ||
          data?.districtStores ||
          data?.district_stores ||
          []
      );

      const available = normalizeStores(
        data?.nonAssignedStores ||
          data?.non_assigned_stores ||
          data?.unmappedStores ||
          data?.unmapped_stores ||
          data?.retailStores ||
          data?.retail_stores ||
          data?.stores ||
          []
      ).filter(
        (item) =>
          item.code &&
          !districts.some((district) => district.code === item.code)
      );

      setStores(districts);
      setMappableStores(available);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Total Stores",
        value: String(summary.totalStores),
        icon: Store,
        wrap: "bg-[#FFF3D8]",
        iconColor: "text-[#D99A00]",
        changeColor: "text-[#14C738]",
      },
      {
        title: "Active Stores",
        value: String(summary.activeStores),
        icon: Warehouse,
        wrap: "bg-[#DDFBE5]",
        iconColor: "text-[#16A34A]",
        changeColor: "text-[#FF1F2D]",
      },
      {
        title: "Total Employees",
        value: String(summary.totalEmployees),
        icon: Users,
        wrap: "bg-[#DDEBFF]",
        iconColor: "text-[#2563EB]",
      },
      {
        title: "Total Revenue",
        value: formatCurrency(summary.totalRevenue),
        icon: TrendingUp,
        wrap: "bg-[#D9FBE0]",
        iconColor: "text-[#16A34A]",
      },
    ],
    [summary]
  );

  async function handleCreateStore(
    form: StoreForm,
    selectedStoreCodes: string[]
  ) {
    setSuccess("");
    setError("");

    const storeCode = form.store_code.trim().toUpperCase();

    await createHeadStore({
      store_name: form.store_name.trim(),
      level: form.level,
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      store_code: storeCode,
    });

    if (form.level === "District" && selectedStoreCodes.length > 0) {
      await mapStoresToDistrict({
        district_store_code: storeCode,
        store_codes: selectedStoreCodes,
      });
    }

    setOpenCreate(false);
    setSuccess("Store created successfully.");
    await loadDashboard();
  }

  return (
    <main className="min-h-screen bg-erp-bg text-erp-text">
      <section className="mx-auto w-full max-w-[1500px]">
        <div className="mb-7">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-erp-text sm:text-[34px]">
            Store Management
          </h1>

          <p className="mt-1 text-[16px] font-medium text-erp-muted">
            Manage all district stores
          </p>
        </div>

        {error ? (
          <AlertCard
            type="error"
            message={error}
            onClose={() => setError("")}
          />
        ) : null}

        {success ? (
          <AlertCard
            type="success"
            message={success}
            onClose={() => setSuccess("")}
          />
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex h-[128px] flex-col justify-between rounded-[24px] border border-erp-border bg-erp-card p-4 shadow-erp-card sm:h-[160px] sm:rounded-[28px] sm:p-5"
              >
                <div
                  className={cn(
                    "flex h-[48px] w-[48px] items-center justify-center rounded-[16px] sm:h-[54px] sm:w-[54px] sm:rounded-[17px]",
                    item.wrap
                  )}
                >
                  <Icon
                    className={cn("h-6 w-6 sm:h-7 sm:w-7", item.iconColor)}
                  />
                </div>

                <div>
                  <p className="truncate text-[13px] font-medium text-erp-muted sm:text-[15px]">
                    {item.title}
                  </p>

                  <div className="mt-1 flex items-end justify-between gap-2">
                    <h2 className="truncate text-[24px] font-bold leading-none tracking-[-0.04em] text-erp-text sm:text-[30px]">
                      {loading ? "..." : item.value}
                    </h2>

                    {item.change ? (
                      <span
                        className={cn(
                          "hidden shrink-0 text-[15px] font-semibold sm:block",
                          item.changeColor
                        )}
                      >
                        {item.change}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-9 flex flex-row items-center justify-between gap-4">
          <h2 className="text-[24px] font-bold tracking-[-0.03em] text-erp-text sm:text-[28px]">
            All Stores
          </h2>

          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex h-[40px] shrink-0 items-center justify-center gap-2 rounded-erp-full bg-erp-dark px-4 text-[14px] font-semibold text-white shadow-erp-sm transition hover:brightness-110 sm:h-[44px] sm:px-6 sm:text-[15px]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Store</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {loading ? (
          <div className="mt-7 flex h-[220px] items-center justify-center rounded-[26px] border border-erp-border bg-erp-card shadow-erp-card">
            <Loader2 className="h-7 w-7 animate-spin text-erp-text" />
          </div>
        ) : (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => (
              <StoreCard key={store.id} {...store} />
            ))}

            {stores.length === 0 && !error ? (
              <div className="col-span-full flex h-[180px] items-center justify-center rounded-[26px] border border-erp-border bg-erp-card text-[15px] font-semibold text-erp-muted shadow-erp-card">
                No district stores found.
              </div>
            ) : null}
          </div>
        )}
      </section>

      {openCreate ? (
        <CreateStoreModal
          associatedStores={mappableStores}
          onClose={() => setOpenCreate(false)}
          onSubmit={handleCreateStore}
        />
      ) : null}
    </main>
  );
}

function StoreCard({ id, name, code }: DistrictStore) {
  return (
    <Link
      href={`/head-office/store-management/${encodeURIComponent(id)}`}
      className="group flex min-h-[104px] items-center justify-between rounded-[24px] border border-erp-border bg-erp-card px-5 py-5 shadow-erp-card transition hover:-translate-y-[1px] hover:shadow-[0_8px_22px_rgba(15,23,42,0.09)] sm:min-h-[108px] sm:rounded-[26px] sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[18px] bg-[#EFF6FF]">
          <Store className="h-8 w-8 text-[#0667D8]" />
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-[18px] font-bold leading-tight tracking-[-0.02em] text-erp-text sm:text-[20px]">
            {name}
          </h3>

          <p className="mt-1 truncate text-[14px] font-medium text-erp-muted sm:text-[15px]">
            {code}
          </p>
        </div>
      </div>

      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-erp-card-soft transition group-hover:bg-[#EAF2FF]">
        <ArrowRight className="h-4 w-4 text-erp-text" />
      </span>
    </Link>
  );
}

function CreateStoreModal({
  associatedStores,
  onClose,
  onSubmit,
}: {
  associatedStores: DistrictStore[];
  onClose: () => void;
  onSubmit: (form: StoreForm, selectedStoreCodes: string[]) => Promise<void>;
}) {
  const [form, setForm] = useState<StoreForm>(initialForm);
  const [selected, setSelected] = useState<string[]>([]);
  const [openLevel, setOpenLevel] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const showAssociatedStores = form.level === "District";

  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return associatedStores;

    return associatedStores.filter(
      (store) =>
        store.name.toLowerCase().includes(q) ||
        store.code.toLowerCase().includes(q)
    );
  }, [associatedStores, search]);

  useEffect(() => {
    if (form.level !== "District") {
      setSelected([]);
      setSearch("");
    }
  }, [form.level]);

  function updateField<K extends keyof StoreForm>(key: K, value: StoreForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.store_name.trim()) return "Store name is required.";
    if (!form.level.trim()) return "Store level is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.pincode.trim()) return "Pincode is required.";

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      return "Pincode must be 6 digits.";
    }

    if (!form.store_code.trim()) return "Store code is required.";

    return "";
  }

  async function handleSubmit() {
    const message = validate();

    if (message) {
      setError(message);
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSubmit(form, selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create store.");
    } finally {
      setSaving(false);
    }
  }

  function toggleStore(code: string) {
    setSelected((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code]
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 px-3 py-4 backdrop-blur-[2px] sm:px-6">
      <div className="relative max-h-[calc(100vh-32px)] w-full max-w-[560px] overflow-hidden rounded-[28px] border border-erp-border bg-erp-card shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:rounded-[34px]">
        <div className="flex items-center justify-between px-[26px] pb-[18px] pt-[24px] sm:px-[28px]">
          <h3 className="text-[20px] font-bold leading-none tracking-[-0.03em] text-erp-text">
            Create New Store
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#111827] transition hover:bg-erp-card-soft disabled:opacity-60"
            aria-label="Close"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-112px)] overflow-y-auto px-[26px] pb-[26px] sm:px-[28px]">
          <section className="rounded-[20px] bg-erp-card-soft px-[18px] pb-[18px] pt-[18px] sm:rounded-[22px]">
            <h4 className="mb-[18px] text-[17px] font-bold leading-none tracking-[-0.02em] text-erp-text">
              Add Store Details
            </h4>

            <div className="grid grid-cols-1 gap-x-[14px] gap-y-[14px] sm:grid-cols-[1.25fr_0.85fr]">
              <Field label="Store Name">
                <input
                  value={form.store_name}
                  onChange={(e) => updateField("store_name", e.target.value)}
                  className="field-input"
                />
              </Field>

              <Field label="Level">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenLevel((prev) => !prev)}
                    className="field-input flex items-center justify-between text-left"
                  >
                    <span>{form.level || "Select"}</span>

                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition",
                        openLevel && "rotate-180"
                      )}
                    />
                  </button>

                  {openLevel ? (
                    <div className="absolute right-0 top-[44px] z-30 w-full overflow-hidden rounded-[14px] border border-erp-border bg-white p-1 shadow-erp-card">
                      {LEVEL_OPTIONS.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            updateField("level", level);
                            setOpenLevel(false);
                          }}
                          className={cn(
                            "block w-full rounded-[10px] px-3 py-2.5 text-left text-[14px] font-semibold transition",
                            form.level === level
                              ? "bg-erp-dark text-white"
                              : "text-erp-text hover:bg-erp-card-soft"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Field>

              <Field label="Address">
                <input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="field-input"
                />
              </Field>

              <Field label="Pincode">
                <input
                  value={form.pincode}
                  onChange={(e) =>
                    updateField(
                      "pincode",
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  inputMode="numeric"
                  className="field-input"
                />
              </Field>

              <Field label="Store Code">
                <input
                  value={form.store_code}
                  onChange={(e) =>
                    updateField("store_code", e.target.value.toUpperCase())
                  }
                  className="field-input uppercase"
                />
              </Field>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex h-[40px] w-full items-center justify-center rounded-[10px] bg-erp-dark px-5 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save
                </button>
              </div>
            </div>
          </section>

          {showAssociatedStores ? (
            <section className="mt-[18px] rounded-[20px] bg-erp-card-soft px-[18px] pb-[18px] pt-[18px] sm:rounded-[22px]">
              <h4 className="text-[17px] font-bold leading-none tracking-[-0.02em] text-erp-text">
                Select Associated Stores
              </h4>

              <label className="mt-[18px] block text-[15px] font-medium leading-none text-erp-text">
                Stores List
              </label>

              <div className="mt-[10px] flex h-[38px] items-center rounded-[10px] bg-white px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 text-erp-muted" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stores..."
                  className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-medium text-erp-text outline-none placeholder:text-erp-muted"
                />
              </div>

              <div className="mt-[10px] max-h-[92px] space-y-[8px] overflow-y-auto pr-1">
                {filteredStores.map((store) => {
                  const active = selected.includes(store.code);

                  return (
                    <button
                      key={store.code}
                      type="button"
                      onClick={() => toggleStore(store.code)}
                      className="flex h-[38px] w-full items-center justify-between rounded-[10px] bg-white px-[14px] text-left text-[14px] font-medium text-erp-text transition hover:bg-[#F8FAFC]"
                    >
                      <span className="truncate">
                        {store.name}{" "}
                        <span className="text-erp-muted">({store.code})</span>
                      </span>

                      <span
                        className={cn(
                          "ml-3 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[7px] transition",
                          active
                            ? "bg-erp-dark text-white"
                            : "bg-[#D9D9D9] text-transparent"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </span>
                    </button>
                  );
                })}

                {filteredStores.length === 0 ? (
                  <div className="flex h-[46px] items-center justify-center rounded-[10px] bg-white text-[13px] font-semibold text-erp-muted">
                    No stores available for mapping.
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-[24px] grid grid-cols-2 gap-[14px]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-[40px] items-center justify-center rounded-[10px] border border-erp-border bg-white px-5 text-[15px] font-semibold text-erp-text transition hover:bg-erp-card-soft disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex h-[40px] items-center justify-center rounded-[10px] bg-erp-dark px-5 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Store
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .field-input {
          height: 40px;
          width: 100%;
          border-radius: 10px;
          border: 0;
          background: white;
          padding: 0 14px;
          font-size: 14px;
          font-weight: 500;
          color: rgb(var(--erp-text, 17 24 39));
          outline: none;
          transition: box-shadow 160ms ease;
        }

        .field-input:focus {
          box-shadow: 0 0 0 2px rgba(36, 93, 219, 0.12);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-[8px] block text-[15px] font-medium leading-none text-erp-text">
        {label}
      </span>
      {children}
    </label>
  );
}

function AlertCard({
  type,
  message,
  onClose,
}: {
  type: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex items-center justify-between gap-3 rounded-[18px] border px-5 py-4 text-[14px] font-semibold",
        type === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      )}
    >
      <span>{message}</span>

      <button type="button" onClick={onClose} className="shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function normalizeStores(items: DashboardStore[] = []): DistrictStore[] {
  return items
    .map((item) => {
      const code = String(item.store_code || item.code || item.id || "");

      return {
        id: code,
        name: String(item.store_name || item.name || "Store"),
        code,
        level: item.level,
      };
    })
    .filter((item) => item.code);
}

function formatCurrency(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;

  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}