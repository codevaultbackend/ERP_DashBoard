import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-[#111827]">Unauthorized</h1>
        <p className="mt-3 text-sm text-[#6B7280]">
          You do not have permission to access this page.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-medium text-white"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}