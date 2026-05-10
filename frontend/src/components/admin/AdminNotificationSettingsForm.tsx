"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { showToast } from "@/lib/swal";
import { useAuthStore } from "@/store/auth";
import ToggleRow from "@/components/settings/ToggleRow";

export default function AdminNotificationSettingsForm() {
  const role = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = role === "super_admin";
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    showToast(`Preferensi notifikasi ${isSuperAdmin ? "Super Admin" : "admin"} berhasil disimpan.`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <ToggleRow
        id={isSuperAdmin ? "superAdminApprovalNotification" : "adminCriticalActivity"}
        title={isSuperAdmin ? "Approval Admin Baru" : "Aktivitas Kritis"}
        description={isSuperAdmin ? "Notifikasi saat ada pendaftaran admin baru yang perlu disetujui." : "Notifikasi saat ada aktivitas penting yang membutuhkan perhatian admin."}
        checked={notificationEnabled}
        onChange={setNotificationEnabled}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" icon={<Save size={18} />}>Simpan</Button>
      </div>
    </form>
  );
}
