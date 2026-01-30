import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - StillRead",
  description: "Sign in or create an account to continue reading",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 animate-gradient">
      <div className="w-full max-w-md animate-fade-in">{children}</div>
    </div>
  );
}
