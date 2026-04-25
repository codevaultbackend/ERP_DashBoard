"use client";

import { Search } from "lucide-react";
import { FileText, Wifi } from "lucide-react";
import type { Product } from "../../../../features/retail/data/billing-data";
import { formatCurrency } from "../../../../features/retail/utils/billing-utils";

type Props = {
    query: string;
    setQuery: (value: string) => void;
    showSuggestions: boolean;
    setShowSuggestions: (value: boolean) => void;
    suggestions: Product[];
    onSubmit: (e: React.FormEvent) => void;
    onSelectProduct: (product: Product) => void;
};

export default function BillingSearchBar({
    query,
    setQuery,
    showSuggestions,
    setShowSuggestions,
    suggestions,
    onSubmit,
    onSelectProduct,
}: Props) {
    return (
        <div className="relative flex gap-[11px] items-center my-[32px]">
            <div className="relative max-w-[90%] w-full">
                <form onSubmit={onSubmit} className="relative ">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />
                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Scan or enter product code (e.g., GN001, SR002)..."
                    className="h-[40px] w-full rounded-full border border-[#E5E7EB] bg-white pl-[48px] pr-5 text-[14px] font-[400] text-[#111827] outline-none placeholder:text-[16px] placeholder:font-medium placeholder:text-[#98A2B3] shadow-[0px_2px_8px_rgba(15,23,42,0.03)] transition focus:border-[#D7DBE2] focus:ring-2 focus:ring-[#EEF2FF]"
                />
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-20 overflow-hidden rounded-[22px] border border-[#E6EAF0] bg-white shadow-[0px_20px_50px_rgba(15,23,42,0.10)]">
                    {suggestions.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectProduct(item)}
                            className="flex w-full items-center justify-between gap-4 border-b border-[#EEF1F5] px-5 py-4 text-left transition last:border-b-0 hover:bg-[#F8FAFC]"
                        >
                            <div>
                                <p className="text-[15px] font-semibold text-[#111827]">
                                    {item.name}
                                </p>
                                <p className="mt-1 text-[13px] font-medium text-[#667085]">
                                    {item.code}
                                </p>
                            </div>

                            <span className="text-[14px] font-semibold text-[#111827]">
                                {formatCurrency(item.metalValue + item.makingCharges)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            </div>
            
            <button
                type="button"
                className="inline-flex h-[40px] items-center gap-3 rounded-full bg-[#020617] px-5 text-[15px] font-medium text-white shadow-[0px_8px_18px_rgba(2,6,23,0.18)] transition hover:scale-[1.01] w-[227px]"
            >
                <FileText className="h-4.5 w-4.5" />
                <span className="whitespace-nowrap">Pending Amounts</span>
            </button>
        </div>
    );
}