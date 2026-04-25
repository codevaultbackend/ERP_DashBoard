import ProtectedLayout from "@/shared/components/ProtectedLayout";
import AppShell from "@/features/layout/components/AppShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <AppShell role="retail">{children}</AppShell>
    </ProtectedLayout>
  );
}