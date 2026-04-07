import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Admin Panel",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
      {children}
    </div>
  );
}
