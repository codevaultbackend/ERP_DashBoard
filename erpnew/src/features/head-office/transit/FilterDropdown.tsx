// components/ui/FilterDropdown.tsx

"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Option[];
  width?: string;
}

export default function FilterDropdown({
  value,
  onChange,
  placeholder,
  options,
  width = "100%",
}: FilterDropdownProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={onChange}
    >
      <Select.Trigger
        className="
          flex
          h-14
          items-center
          justify-between
          rounded-full
          border
          border-slate-200
          bg-white
          px-5
          text-sm
          font-medium
          text-slate-900
          shadow-sm
          outline-none
          transition-all
          hover:border-slate-300
          hover:shadow-md
          focus:ring-4
          focus:ring-indigo-500/10
        "
        style={{ width }}
      >
        <Select.Value placeholder={placeholder} />

        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="
            z-[9999]
            max-h-[320px]
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
          "
        >
          <Select.Viewport className="p-2">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="
                  relative
                  flex
                  cursor-pointer
                  items-center
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  text-slate-700
                  outline-none
                  hover:bg-slate-100
                  data-[highlighted]:bg-indigo-50
                  data-[highlighted]:text-indigo-600
                "
              >
                <Select.ItemText>
                  {option.label}
                </Select.ItemText>

                <Select.ItemIndicator className="absolute right-4">
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}