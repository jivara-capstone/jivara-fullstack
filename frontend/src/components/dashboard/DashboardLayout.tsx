"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import { showConfirm, showToast } from "@/lib/swal";
import { useAuthStore } from "@/store/auth";
import NurseDashboardNavbar from "./NurseDashboardNavbar";

interface DashboardLayoutProps {
  readonly children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout, refreshToken } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await showConfirm("Keluar Akun?", "Anda perlu masuk kembali untuk mengakses data Anda.", "Ya, Keluar");

    if (result.isConfirmed) {
      try {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      } catch {
        // Logout backend gagal, lanjutkan logout lokal.
      }

      logout();
      Cookies.remove("jivara-token");
      showToast("Berhasil keluar dari akun.", "success");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <NurseDashboardNavbar onLogout={handleLogout} />
      {children}
    </div>
  );
}
