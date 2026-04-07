import type { Metadata } from "next";
import DashboardSidebar from "@/components/DashboardSidebar";

export const metadata: Metadata = {
  title: "Dashboard | Admin Panel",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
