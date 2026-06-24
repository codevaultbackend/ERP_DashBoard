"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  isHeadOfficeUser,
  isDistrictUser,
} from "@/core/auth/permissions";

import {
  getRetailStoresForTransfer,
  getDistrictStoresForTransfer,
  transferRequestToRetail,
  transferRequestToDistrict,
  TransferStore,
} from "@/features/district/request/request/api/transfer-api";

type Props = {
  open: boolean;
  requestId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function TransferRequestModal({
  open,
  requestId,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] =
    useState(false);

  const [stores, setStores] = useState<
    TransferStore[]
  >([]);

  const [selectedStore, setSelectedStore] =
    useState("");

  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;

    setSelectedStore("");
    setNotes("");
    setError("");
    setSuccess("");

    fetchStores();
  }, [open]);

  const fetchStores = async () => {
    try {
      setStoresLoading(true);

      if (isHeadOfficeUser()) {
        const response =
          await getDistrictStoresForTransfer();

        setStores(response?.data || []);
      } else if (isDistrictUser()) {
        const response =
          await getRetailStoresForTransfer();

        setStores(response?.data || []);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error(
        "Store fetch failed:",
        error
      );
    } finally {
      setStoresLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!requestId) {
      setError("Invalid request");
      return;
    }

    if (!selectedStore) {
      setError(
        isHeadOfficeUser()
          ? "Please select district store"
          : "Please select retail store"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isHeadOfficeUser()) {
        await transferRequestToDistrict(
          requestId,
          {
            district_store_code:
              selectedStore,
            notes,
          }
        );
      } else if (isDistrictUser()) {
        await transferRequestToRetail(
          requestId,
          {
            retail_store_code:
              selectedStore,
            notes,
          }
        );
      }

      setSuccess(
        "Request transferred successfully"
      );

      setTimeout(() => {
        onSuccess?.();
        onClose();

        setSelectedStore("");
        setNotes("");
        setSuccess("");
      }, 1200);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to transfer request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[560px] rounded-[28px] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7">
          <h2 className="text-[30px] font-semibold text-[#101828]">
            {isHeadOfficeUser()
              ? "Select District Store to Transfer Request"
              : "Select Retail Store to Transfer Request"}
          </h2>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="mb-2 block text-[15px] font-medium text-[#344054]">
              {isHeadOfficeUser()
                ? "Select District Store"
                : "Select Retail Store"}
            </label>

            <select
              value={selectedStore}
              onChange={(e) =>
                setSelectedStore(
                  e.target.value
                )
              }
              className="h-[56px] w-full rounded-[16px] border border-[#D0D5DD] px-4 outline-none"
            >
              <option value="">
                {storesLoading
                  ? "Loading..."
                  : isHeadOfficeUser()
                    ? "Select District Store"
                    : "Select Retail Store"}
              </option>

              {stores.map((store) => (
                <option
                  key={store.id}
                  value={store.store_code}
                >
                  {store.store_name} (
                  {store.store_code})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-[15px] font-medium text-[#344054]">
              Additional Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Add any additional information..."
              className="h-[120px] w-full resize-none rounded-[16px] border border-[#D0D5DD] p-4 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 px-7 pb-7">
          <button
            onClick={onClose}
            className="h-[52px] flex-1 rounded-[14px] border border-[#D0D5DD] text-[16px] font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              storesLoading ||
              !selectedStore
            }
            className="flex h-[52px] flex-1 items-center justify-center rounded-[14px] bg-[#020617] text-[16px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </div>
            ) : (
              "Send Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}