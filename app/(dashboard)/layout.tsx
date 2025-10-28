import DashboardHeader from "@/components/dashboard-header";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <DashboardHeader />
      {children}
    </div>
  );
}
