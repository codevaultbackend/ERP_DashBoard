"use client";

import Image from "next/image";
import { Fragment, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  XCircle,
} from "lucide-react";
import { AuditIssue, AuditStatus, Category } from "../types";

type Props = {
  storeId: string;
  categories?: Category[];
  onAuditSubmit: (categoryId: string, issue: AuditIssue) => void;
};

const parentHeaders = [
  "Category",
  "Code",
  "Quantity",
  "Selling Price",
  "Making Chg.",
  "Purity",
  "Net Wt.",
  "Stone Wt.",
  "Gross Wt.",
  "Audit",
  "Action",
];

const childHeaders = [
  "View Article",
  "Article",
  "Code",
  "Quantity",
  "Purity",
  "Net Wt.",
  "Stone Wt.",
  "Gross Wt.",
  "Checklist",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: AuditStatus }) {
  if (status === "pass") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Passed
      </span>
    );
  }

  if (status === "issue") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        <XCircle className="h-4 w-4" />
        Issue Found
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <AlertTriangle className="h-4 w-4" />
      Pending
    </span>
  );
}

function AuditModal({
  open,
  selectedCount,
  issue,
  setIssue,
  onClose,
  onSubmit,
}: {
  open: boolean;
  selectedCount: number;
  issue: AuditIssue;
  setIssue: (value: AuditIssue) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Create Audit</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500">{selectedCount} items selected</p>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Select Issue
          </label>
          <select
            value={issue}
            onChange={(e) => setIssue(e.target.value as AuditIssue)}
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none"
          >
            <option value="pass">Pass</option>
            <option value="missing_item">Missing Item</option>
            <option value="damage">Damage</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Submit Audit
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagePreviewModal({
  image,
  onClose,
}: {
  image: string | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <Image src={image} alt="Preview" fill className="object-contain" />
        </div>
      </div>
    </div>
  );
}

export default function StoreManagementCategoryTable({
  categories = [],
  onAuditSubmit,
}: Props) {
  const safeCategories = Array.isArray(categories) ? categories : [];

  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [reportedItems, setReportedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditCategoryId, setAuditCategoryId] = useState<string | null>(null);
  const [auditIssue, setAuditIssue] = useState<AuditIssue>("pass");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const selectedCountForCategory = useMemo(() => {
    if (!auditCategoryId) return 0;

    const category = safeCategories.find((c) => c.id === auditCategoryId);
    if (!category) return 0;

    return category.items.filter(
      (item) => selectedItems[item.id] && !reportedItems[item.id]
    ).length;
  }, [auditCategoryId, safeCategories, selectedItems, reportedItems]);

  const handleToggleRow = (categoryId: string) => {
    setOpenCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleToggleItem = (itemId: string) => {
    if (reportedItems[itemId]) return;

    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const getSelectedCount = (category: Category) => {
    return category.items.filter(
      (item) => selectedItems[item.id] && !reportedItems[item.id]
    ).length;
  };

  const handleOpenAudit = (categoryId: string) => {
    const category = safeCategories.find((c) => c.id === categoryId);
    if (!category) return;

    if (getSelectedCount(category) === 0) return;

    setAuditCategoryId(categoryId);
    setAuditModalOpen(true);
  };

  const handleSubmitAudit = () => {
    if (!auditCategoryId) return;

    const category = safeCategories.find((c) => c.id === auditCategoryId);
    if (!category) return;

    const ids = category.items
      .filter((item) => selectedItems[item.id] && !reportedItems[item.id])
      .map((item) => item.id);

    if (!ids.length) return;

    setReportedItems((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = true;
      });
      return next;
    });

    setSelectedItems((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = false;
      });
      return next;
    });

    onAuditSubmit(auditCategoryId, auditIssue);
    setAuditModalOpen(false);
    setAuditCategoryId(null);
    setAuditIssue("pass");
  };

  return (
    <>
      <div className="overflow-hidden rounded-[32px] border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-[1320px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#020617]">
                {parentHeaders.map((header, index) => (
                  <th
                    key={header}
                    className={cn(
                      "px-6 py-6 text-left text-[15px] font-semibold text-white whitespace-nowrap",
                      index === 0 && "rounded-tl-[32px]",
                      index === parentHeaders.length - 1 && "rounded-tr-[32px]",
                      [
                        "Quantity",
                        "Selling Price",
                        "Making Chg.",
                        "Purity",
                        "Net Wt.",
                        "Stone Wt.",
                        "Gross Wt.",
                        "Audit",
                        "Action",
                      ].includes(header) && "text-center"
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {safeCategories.map((category, rowIndex) => {
                const isOpen = openCategoryId === category.id;
                const isLastRow = rowIndex === safeCategories.length - 1;
                const selectedCount = getSelectedCount(category);

                return (
                  <Fragment key={category.id}>
                    <tr className="bg-white transition hover:bg-[#FAFBFC]">
                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-[15px] font-medium text-[#0F172A]">
                        {category.name}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-[15px] font-medium text-[#0F172A]">
                        {category.code}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.quantity}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.sellingPrice}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.makingCharge}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.purity}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.netWt}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.stoneWt}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.grossWt}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center">
                        <StatusBadge status={category.auditStatus} />
                      </td>

                      <td
                        className={cn(
                          "border-b border-[#E5E7EB] px-6 py-7 text-center",
                          !isOpen && isLastRow && "rounded-br-[32px]"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleRow(category.id)}
                          className="inline-flex items-center gap-2 text-[15px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          <span>View</span>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td
                          colSpan={11}
                          className={cn(
                            "bg-[#F8FAFC] p-0",
                            isLastRow && "rounded-b-[32px]"
                          )}
                        >
                          <div className="w-full overflow-hidden">
                            <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#EEF2F7] px-6 py-4">
                              <div>
                                <h3 className="text-[15px] font-semibold text-[#111827]">
                                  {category.name} Items
                                </h3>
                                <p className="mt-1 text-xs text-[#64748B]">
                                  Select items and create audit
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenAudit(category.id)}
                                disabled={selectedCount === 0}
                                className={cn(
                                  "rounded-xl px-4 py-2 text-xs font-medium text-white transition",
                                  selectedCount === 0
                                    ? "cursor-not-allowed bg-slate-300"
                                    : "bg-[#020222] hover:bg-[#0A0A2A]"
                                )}
                              >
                                Create Audit
                              </button>
                            </div>

                            <table className="w-full border-separate border-spacing-0">
                              <thead>
                                <tr className="bg-[#EEF2F7]">
                                  {childHeaders.map((header, index) => (
                                    <th
                                      key={header}
                                      className={cn(
                                        "border-b border-r border-[#E5E7EB] px-6 py-4 text-left text-[14px] font-semibold text-[#161616] whitespace-nowrap",
                                        [
                                          "Quantity",
                                          "Purity",
                                          "Net Wt.",
                                          "Stone Wt.",
                                          "Gross Wt.",
                                          "Checklist",
                                        ].includes(header) && "text-center",
                                        index === childHeaders.length - 1 &&
                                          "border-r-0"
                                      )}
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody>
                                {category.items.map((item, itemIndex) => {
                                  const isReported = !!reportedItems[item.id];
                                  const isSelected = !!selectedItems[item.id];
                                  const isLastItem =
                                    itemIndex === category.items.length - 1;

                                  return (
                                    <tr
                                      key={item.id}
                                      className="bg-[#F8FAFC] transition hover:bg-[#F1F5F9]"
                                    >
                                      <td className="border-b border-r border-[#E5E7EB] px-6 py-4">
                                        <button
                                          type="button"
                                          onClick={() => setPreviewImage(item.image)}
                                          className="block w-fit cursor-pointer"
                                        >
                                          <div className="relative h-[28px] w-[76px] overflow-hidden rounded-[6px] bg-[#F4DCE6] transition hover:opacity-90">
                                            <Image
                                              src={item.image}
                                              alt={item.name}
                                              fill
                                              className="object-cover"
                                              draggable={false}
                                            />
                                          </div>
                                        </button>
                                      </td>

                                      <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-[14px] font-medium text-[#1F2937]">
                                        {item.name}
                                      </td>

                                      <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-[14px] font-medium text-[#1F2937]">
                                        {item.code}
                                      </td>

                                      <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                        {item.quantity}
                                      </td>

                                      <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                        {item.purity}
                                      </td>

                                      <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                        {item.netWt}
                                      </td>

                                      <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                        {item.stoneWt}
                                      </td>

                                      <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                        {item.grossWt}
                                      </td>

                                      <td
                                        className={cn(
                                          "border-b border-[#E5E7EB] px-6 py-4 text-center",
                                          isLastItem &&
                                            isLastRow &&
                                            "rounded-br-[32px]"
                                        )}
                                      >
                                        {isReported ? (
                                          <span className="mx-auto inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#22C55E] text-white shadow-[0px_4px_10px_rgba(34,197,94,0.24)]">
                                            <Check size={16} strokeWidth={3} />
                                          </span>
                                        ) : (
                                          <label className="inline-flex cursor-pointer items-center justify-center">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() =>
                                                handleToggleItem(item.id)
                                              }
                                              className="peer sr-only"
                                            />
                                            <span
                                              className={cn(
                                                "flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border transition-all",
                                                isSelected
                                                  ? "border-[#020222] bg-[#020222]"
                                                  : "border-[#B8C0CC] bg-white"
                                              )}
                                            >
                                              {isSelected && (
                                                <Check
                                                  size={14}
                                                  strokeWidth={3}
                                                  className="text-white"
                                                />
                                              )}
                                            </span>
                                          </label>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {safeCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-10 text-center text-[15px] font-medium text-[#6B7280]"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AuditModal
        open={auditModalOpen}
        selectedCount={selectedCountForCategory}
        issue={auditIssue}
        setIssue={setAuditIssue}
        onClose={() => {
          setAuditModalOpen(false);
          setAuditCategoryId(null);
          setAuditIssue("pass");
        }}
        onSubmit={handleSubmitAudit}
      />

      <ImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}