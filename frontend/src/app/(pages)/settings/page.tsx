"use client";

import { DashboardLayout } from "@/components/dashboard";
import { NurseSettingsPage, PatientSettingsPage } from "@/components/settings";
import { useAuthStore } from "@/store/auth";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const shouldShowNurseSettings = user?.role === "nurse" || user?.role === "admin";

  return (
    <DashboardLayout>
      {shouldShowNurseSettings ? <NurseSettingsPage /> : <PatientSettingsPage />}
    </DashboardLayout>
  );
}
