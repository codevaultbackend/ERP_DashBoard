"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Download,
  CalendarDays,
  Store,
  User,
  FileText,
} from "lucide-react";

import {
  downloadRetailAudit,
  getRetailAuditById,
} from "../api/retail-audit-api";

import type {
  RetailAuditDetails,
  RetailAuditDetailsDrawerProps,
} from "../types/retail-audit.types";

function formatDate(
  value?: string
) {
  if (!value) return "--";

  try {
    return new Date(
      value
    ).toLocaleDateString(
      "en-GB"
    );
  } catch {
    return "--";
  }
}

function statusClass(
  status?: string
) {
  switch (
  String(
    status
  ).toLowerCase()
  ) {
    case "completed":
    case "approved":
      return `
        bg-green-50
        text-green-700
        border-green-200
      `;

    case "pending":
      return `
        bg-yellow-50
        text-yellow-700
        border-yellow-200
      `;

    case "rejected":
      return `
        bg-red-50
        text-red-700
        border-red-200
      `;

    default:
      return `
        bg-slate-50
        text-slate-700
        border-slate-200
      `;
  }
}

export default function RetailAuditDetailsDrawer({
  open,
  auditId,
  storeCode,
  onClose,
}: RetailAuditDetailsDrawerProps) {
  const [loading, setLoading] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [audit, setAudit] =
    useState<RetailAuditDetails | null>(
      null
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open || !auditId)
      return;

    const loadAudit =
      async () => {
        try {
          setLoading(true);

          setError("");

          const response =
            await getRetailAuditById(
              auditId
            );

          setAudit(
            response
          );
        } catch (
        err: any
        ) {
          setError(
            err?.response?.data
              ?.message ||
            err?.message ||
            "Failed to load audit"
          );
        } finally {
          setLoading(false);
        }
      };

    loadAudit();
  }, [
    open,
    auditId,
  ]);

  const handleDownload = async () => {
    if (!storeCode || !auditId) {
      console.log("Missing download params", {
        storeCode,
        auditId,
      });
      return;
    }

    try {
      setDownloading(true);

      await downloadRetailAudit(
        storeCode,
        auditId
      );

    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloading(false);
    }
  };
  if (!open)
    return null;

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className="
          fixed
          inset-0
          z-[99998]
          bg-black/40
          backdrop-blur-[2px]
        "
      />

      {/* Drawer */}

      <div
        className="
          fixed
          right-0
          top-0
          z-[99999]
          h-screen
          w-full
          max-w-[700px]
          overflow-hidden
          border-l
          border-[#E5E7EB]
          bg-white
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-[#E5E7EB]
            px-6
            py-5
          "
        >
          <div>
            <h2
              className="
                text-[24px]
                font-bold
                text-[#02011A]
              "
            >
              Audit Details
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-[#64748B]
              "
            >
              Retail Audit Report
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              hover:bg-[#F8FAFC]
            "
          >
            <X
              className="
                h-5
                w-5
              "
            />
          </button>
        </div>

        {/* BODY */}

        <div
          className="
            h-[calc(100vh-88px)]
            overflow-y-auto
            p-6
          "
        >
          {loading && (
            <div
              className="
                flex
                h-[400px]
                items-center
                justify-center
              "
            >
              <Loader2
                className="
                  h-8
                  w-8
                  animate-spin
                "
              />
            </div>
          )}

          {error && (
            <div
              className="
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-4
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {!loading &&
            audit && (
              <>
                {/* INFO CARD */}

                <div
                  className="
                    rounded-[28px]
                    border
                    border-[#E5E7EB]
                    bg-white
                    p-5
                    shadow-sm
                  "
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className="
                        text-[20px]
                        font-bold
                      "
                    >
                      {audit.audit_name ||
                        audit.audit_title ||
                        audit.audit_no ||
                        `Audit #${audit.id}`}
                    </h3>

                    <span
                      className={`
                        rounded-full
                        border
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        ${statusClass(
                        audit.status
                      )}
                      `}
                    >
                      {audit.status}
                    </span>
                  </div>

                  <div
                    className="
                      mt-5
                      grid
                      grid-cols-1
                      gap-4
                      md:grid-cols-2
                    "
                  >
                    <InfoRow
                      icon={
                        Store
                      }
                      label="Store"
                      value={
                        audit.store_name ||
                        audit.organization_name
                      }
                    />

                    <InfoRow
                      icon={
                        User
                      }
                      label="Auditor"
                      value={
                        audit.auditor_name
                      }
                    />

                    <InfoRow
                      icon={
                        CalendarDays
                      }
                      label="Created"
                      value={formatDate(
                        audit.created_at
                      )}
                    />

                    <InfoRow
                      icon={
                        CalendarDays
                      }
                      label="Updated"
                      value={formatDate(
                        audit.updated_at
                      )}
                    />
                  </div>

                  {audit.remarks && (
                    <div className="mt-5">
                      <p
                        className="
                          mb-2
                          text-sm
                          font-semibold
                        "
                      >
                        Remarks
                      </p>

                      <div
                        className="
                          rounded-2xl
                          bg-[#F8FAFC]
                          p-4
                          text-sm
                          text-[#475569]
                        "
                      >
                        {audit.remarks}
                      </div>
                    </div>
                  )}
                </div>

                {/* ITEMS */}

                <div
                  className="
                    mt-6
                    rounded-[28px]
                    border
                    border-[#E5E7EB]
                    bg-white
                    shadow-sm
                  "
                >
                  <div className="border-b p-5">
                    <h3
                      className="
                        text-lg
                        font-semibold
                      "
                    >
                      Audited Items
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          className="
                            border-b
                            bg-[#FAFAFA]
                          "
                        >
                          <th className="p-4 text-left text-xs font-semibold">
                            Item
                          </th>

                          <th className="p-4 text-left text-xs font-semibold">
                            Expected
                          </th>

                          <th className="p-4 text-left text-xs font-semibold">
                            Actual
                          </th>

                          <th className="p-4 text-left text-xs font-semibold">
                            Variance
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {audit.items?.map(
                          (
                            item
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                              className="border-b"
                            >
                              <td className="p-4 text-sm">
                                {item.item_name}
                              </td>

                              <td className="p-4 text-sm">
                                {item.expected_qty ??
                                  0}
                              </td>

                              <td className="p-4 text-sm">
                                {item.actual_qty ??
                                  0}
                              </td>

                              <td className="p-4 text-sm">
                                {item.variance_qty ??
                                  0}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* DOWNLOAD */}

                <button
                  onClick={
                    handleDownload
                  }
                  className="
                    mt-6
                    flex
                    h-[56px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[18px]
                    bg-[#02011A]
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  {downloading ? (
                    <Loader2
                      className="
                        h-5
                        w-5
                        animate-spin
                      "
                    />
                  ) : (
                    <Download
                      className="
                        h-5
                        w-5
                      "
                    />
                  )}

                  Download Report
                </button>
              </>
            )}
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: any) {
  return (
    <div className="flex gap-3">
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-[#EEF4FF]
        "
      >
        <Icon
          className="
            h-4
            w-4
            text-[#2563EB]
          "
        />
      </div>

      <div>
        <p
          className="
            text-xs
            font-medium
            uppercase
            text-[#64748B]
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            text-sm
            font-medium
            text-[#02011A]
          "
        >
          {value || "--"}
        </p>
      </div>
    </div>
  );
}