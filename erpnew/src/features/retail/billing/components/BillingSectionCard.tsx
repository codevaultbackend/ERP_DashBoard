import { cn } from "../../../../features/retail/utils/billing-utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function BillingSectionCard({ children, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-[30px] border border-[#E4E7EC] bg-white shadow-[1px_1px_4px_0_#0000001A]",
        className
      )}
    >
      {children}
    </section>
  );
}