"use client";

import { DashboardLayout } from "@/components/dashboard";
import NurseDashboardPage from "@/components/dashboard/NurseDashboardPage";
import PatientDashboardPage from "@/components/patient-dashboard/PatientDashboardPage";
import { useAuthStore } from "@/store/auth";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const shouldShowNurseDashboard = user?.role === "nurse" || user?.role === "admin";

  return (
    <DashboardLayout>
      {shouldShowNurseDashboard ? <NurseDashboardPage /> : <PatientDashboardPage />}
    </DashboardLayout>
  );
}
