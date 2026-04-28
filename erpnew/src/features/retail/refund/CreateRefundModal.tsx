"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateRefundModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Create Refund / Exchange
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Customer */}
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <input className="input" placeholder="Customer Name" />
            <input className="input" placeholder="Phone Number" />
          </div>

          {/* Old Product */}
          <Section title="Original Product" color="red">
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <input className="input" placeholder="Invoice No" />
              <input className="input" placeholder="Product Code" />
              <input className="input" placeholder="Product Name" />
            </div>

            <div className="grid grid-cols-5 gap-4 max-md:grid-cols-2">
              <select className="input">
                <option>Metal</option>
                <option>Gold</option>
                <option>Silver</option>
              </select>

              <select className="input">
                <option>Purity</option>
                <option>24K</option>
                <option>22K</option>
                <option>18K</option>
              </select>

              <input className="input" placeholder="Stone Wt" />
              <input className="input" placeholder="Net Wt" />
              <input className="input" placeholder="Gross Wt" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select className="input">
                <option>Condition</option>
                <option>Good</option>
                <option>Damaged</option>
              </select>
              <input className="input" placeholder="Value" />
            </div>
          </Section>

          {/* New Product */}
          <Section title="New Product" color="green">
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <input className="input" placeholder="Product Code" />
              <input className="input" placeholder="Product Name" />
              <select className="input">
                <option>Metal</option>
                <option>Gold</option>
              </select>
            </div>

            <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
              <select className="input">
                <option>Purity</option>
                <option>22K</option>
              </select>
              <input className="input" placeholder="Stone Wt" />
              <input className="input" placeholder="Net Wt" />
              <input className="input" placeholder="Gross Wt" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select className="input">
                <option>Condition</option>
                <option>New</option>
              </select>
              <input className="input" placeholder="Value" />
            </div>
          </Section>

          {/* Summary */}
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span>Old Value</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>New Value</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between font-semibold mt-2 text-gray-800">
              <span>Final Payable</span>
              <span>₹0</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600"
          >
            Cancel
          </button>
          <button className="px-6 py-2 rounded-lg bg-[#02031A] text-white">
            Create Refund
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: "red" | "green";
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        color === "red"
          ? "border-red-200 bg-red-50"
          : "border-green-200 bg-green-50"
      }`}
    >
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}