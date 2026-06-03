"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  getRetailStoresForTransfer,
  transferRequestToRetail,
  RetailStore,
} from "../api/transfer-api";

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
  const [storesLoading, setStoresLoading] = useState(false);

  const [stores, setStores] = useState<RetailStore[]>([]);
  const [selectedStore, setSelectedStore] = useState("");

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;

    fetchStores();
  }, [open]);

  const fetchStores = async () => {
    try {
      setStoresLoading(true);

      const response =
        await getRetailStoresForTransfer();

      setStores(response?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setStoresLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!requestId) return;

    if (!selectedStore) {
      alert("Please select retail store");
      return;
    }

    try {
      setLoading(true);

      await transferRequestToRetail(requestId, {
        retail_store_code: selectedStore,
        notes,
      });

      onSuccess?.();

      onClose();

      setSelectedStore("");
      setNotes("");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
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
            Select Retail Store to Transfer Request
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          <div>
            <label className="mb-2 block text-[15px] font-medium text-[#344054]">
              Select Retail Store
            </label>

            <select
              value={selectedStore}
              onChange={(e) =>
                setSelectedStore(e.target.value)
              }
              className="h-[56px] w-full rounded-[16px] border border-[#D0D5DD] px-4 outline-none"
            >
              <option value="">
                {storesLoading
                  ? "Loading..."
                  : "Select Retail Store"}
              </option>

              {stores.map((store) => (
                <option
                  key={store.id}
                  value={store.store_code}
                >
                  {store.store_name} ({store.store_code})
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
                setNotes(e.target.value)
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
            disabled={loading}
            className="h-[52px] flex-1 rounded-[14px] bg-[#020617] text-[16px] font-medium text-white"
          >
            {loading
              ? "Sending..."
              : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}