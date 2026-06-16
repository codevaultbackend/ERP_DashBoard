"use client";

import {
ChevronRight,
FileText,
} from "lucide-react";

import type {
RetailAudit,
} from "../types/retail-audit.types";

type Props = {
audit?: RetailAudit | null;
onView?: (
audit: RetailAudit
) => Promise<void> | void;
};

function formatDate(
value?: string
) {
if (!value) return "--";

try {
const date = new Date(value);

if (isNaN(date.getTime())) {
  return "--";
}

return date.toLocaleDateString(
  "en-GB"
);


} catch {
return "--";
}
}

export default function RetailAuditCard({
audit,
onView,
}: Props) {
if (!audit) {
console.warn(
"RetailAuditCard received undefined audit"
);


return null;


}

const title =
audit.audit_name ||
audit.audit_title ||
audit.audit_no ||
`Report ${audit.id}`;

const auditId =
audit.audit_no ||
`AUD-${audit.id}`;

const handleClick = async () => {
try {
if (
typeof onView === "function"
) {
await onView(audit);
}
} catch (error) {
console.error(
"RetailAuditCard click failed:",
error
);
}
};

return (
<button
type="button"
onClick={handleClick}
aria-label={`View audit report ${title}`}
className="
group
relative
w-full
overflow-hidden
rounded-3xl
border
border-[#E8EAED]
bg-white
p-4
sm:p-5
lg:p-6
text-left
transition-all
duration-300
hover:-translate-y-1
hover:border-[#2563EB]
hover:shadow-xl
active:scale-[0.99]
"
> <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div className="flex min-w-0 items-start gap-3 sm:gap-4"> <div
         className="
           flex
           h-[56px]
           w-[56px]
           sm:h-[64px]
           sm:w-[64px]
           shrink-0
           items-center
           justify-center
           rounded-[18px]
           border
           border-[#DBEAFE]
           bg-[#EEF4FF]
         "
       > <FileText
           className="
             h-7
             w-7
             sm:h-8
             sm:w-8
             text-[#2563EB]
           "
         /> </div>

      <div className="min-w-0 flex-1">
        <p
          className="
            mb-1
            text-[11px]
            sm:text-[12px]
            font-medium
            uppercase
            tracking-wider
            text-[#94A3B8]
          "
        >
          Audit Report
        </p>

        <h3
          className="
            break-words
            text-[16px]
            sm:text-[18px]
            lg:text-[20px]
            font-semibold
            leading-tight
            text-[#02011A]
          "
        >
          {title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className="
              text-[12px]
              sm:text-[13px]
              font-medium
              text-[#64748B]
            "
          >
            {formatDate(
              audit.created_at
            )}
          </span>

          <span
            className="
              hidden
              sm:block
              h-1
              w-1
              rounded-full
              bg-[#CBD5E1]
            "
          />

          <span
            className="
              text-[12px]
              sm:text-[13px]
              font-medium
              text-[#2563EB]
            "
          >
            View Report
          </span>
        </div>

        <p
          className="
            mt-2
            break-all
            text-[11px]
            sm:text-[12px]
            text-[#94A3B8]
          "
        >
          {auditId}
        </p>
      </div>
    </div>

    <div
      className="
        flex
        h-10
        w-10
        shrink-0
        self-end
        sm:self-center
        items-center
        justify-center
        rounded-xl
        bg-[#F4F4F5]
      "
    >
      <ChevronRight
        className="
          h-[18px]
          w-[18px]
          text-[#111827]
        "
      />
    </div>
  </div>
</button>

);
}
