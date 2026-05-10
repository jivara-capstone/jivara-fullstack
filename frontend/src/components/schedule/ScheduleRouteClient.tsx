"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import DashboardRouteFallback from "@/components/dashboard/DashboardRouteFallback";
import { getDashboardRole, isOperationalAdminRole } from "@/components/dashboard/navigation";
import { useAuthStore } from "@/store/auth";

const PatientSchedulePage = dynamic(() => import("./PatientSchedulePage"), { ssr: false, loading: () => <DashboardRouteFallback /> });
const SchedulePage = dynamic(() => import("./SchedulePage"), { ssr: false, loading: () => <DashboardRouteFallback /> });

interface ScheduleRouteClientProps {
  readonly initialPatientName?: string;
}

export default function ScheduleRouteClient({ initialPatientName }: ScheduleRouteClientProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const dashboardRole = getDashboardRole(user?.role);

  useEffect(() => {
    if (!hasAuthHydrated || dashboardRole !== "super_admin") return;
    router.replace("/dashboard");
  }, [dashboardRole, hasAuthHydrated, router]);

  if (!hasAuthHydrated) return null;
  if (dashboardRole === "super_admin") return <DashboardRouteFallback />;

  if (isOperationalAdminRole(dashboardRole)) return <SchedulePage initialPatientName={initialPatientName} readOnly />;
  return dashboardRole === "nurse" ? <SchedulePage initialPatientName={initialPatientName} /> : <PatientSchedulePage />;
}
