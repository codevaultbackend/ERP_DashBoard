import { cn } from "../../utils/billing-utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function BillingSectionCard({ children, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-[30px] border border-[#E5E7EB] bg-white shadow-[1px_1px_4px_rgba(0,0,0,0.10)]",
        className
      )}
    >
      {children}
    </section>
  );
}