"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardRouteFallback from "@/components/dashboard/DashboardRouteFallback";
import { useAuthStore } from "@/store/auth";
import { useSplashScreen } from "@/components/ui/AppSplashScreen";
import { getDashboardRole } from "@/components/dashboard/navigation";

const NurseDashboardPage = dynamic(() => import("@/components/dashboard/NurseDashboardPage"), { ssr: false, loading: () => <DashboardRouteFallback /> });
const AdminDashboardPage = dynamic(() => import("@/components/admin/AdminDashboardPage"), { ssr: false, loading: () => <DashboardRouteFallback /> });
const PatientDashboardPage = dynamic(() => import("@/components/patient-dashboard/PatientDashboardPage"), { ssr: false, loading: () => <DashboardRouteFallback /> });

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const dashboardRole = getDashboardRole(user?.role);
  const { isSplashFinished } = useSplashScreen();

  useEffect(() => {
    if (!hasAuthHydrated || !isSplashFinished || dashboardRole !== "super_admin") return;
    router.replace("/admin-approvals");
  }, [dashboardRole, hasAuthHydrated, isSplashFinished, router]);

  if (!hasAuthHydrated || !isSplashFinished) return null;

  if (dashboardRole === "super_admin") return <DashboardRouteFallback />;
  if (dashboardRole === "admin") return <AdminDashboardPage />;
  return dashboardRole === "nurse" ? <NurseDashboardPage /> : <PatientDashboardPage />;
}
