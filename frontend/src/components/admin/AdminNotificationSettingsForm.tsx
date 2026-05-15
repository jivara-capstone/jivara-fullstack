"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { FormDataSkeleton } from "@/components/ui/PageSkeletons";
import { getUserNotificationPreferenceFromApi, updateUserNotificationPreferenceViaApi, type UserNotificationPreferenceKey } from "@/lib/notificationSettingsApi";
import { enableUserPushNotifications } from "@/lib/pushNotifications";
import { showToast } from "@/lib/swal";
import { useAuthStore } from "@/store/auth";
import { useIsStandalonePwa } from "@/hooks";
import ToggleRow from "@/components/settings/ToggleRow";

export default function AdminNotificationSettingsForm() {
  const isStandalonePwa = useIsStandalonePwa();
  const role = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = role === "super_admin";
  const preferenceKey: UserNotificationPreferenceKey = isSuperAdmin ? "super_admin_approval" : "admin_critical_activity";
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getUserNotificationPreferenceFromApi(preferenceKey)
      .then((preference) => {
        if (isMounted) setNotificationEnabled(preference.enabled);
      })
      .catch(() => {
        if (isMounted) setNotificationEnabled(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [preferenceKey]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isStandalonePwa) return;
    setIsSaving(true);

    try {
      if (notificationEnabled) await enableUserPushNotifications();
      await updateUserNotificationPreferenceViaApi(preferenceKey, notificationEnabled);
      showToast(`Preferensi notifikasi ${isSuperAdmin ? "Super Admin" : "admin"} berhasil disimpan.`);
    } catch {
      showToast(`Preferensi notifikasi ${isSuperAdmin ? "Super Admin" : "admin"} gagal disimpan.`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return isLoading ? <FormDataSkeleton /> : (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <ToggleRow
        id={isSuperAdmin ? "superAdminApprovalNotification" : "adminCriticalActivity"}
        title={isSuperAdmin ? "Approval Admin Baru" : "Aktivitas Kritis"}
        description={isSuperAdmin ? "Notifikasi saat ada pendaftaran admin baru yang perlu disetujui." : "Notifikasi saat ada aktivitas penting yang membutuhkan perhatian admin."}
        checked={notificationEnabled}
        onChange={setNotificationEnabled}
      />
      {!isStandalonePwa && (
        <p className="rounded-2xl bg-warning/10 px-4 py-3 text-sm font-bold leading-6 text-warning-dark">
          Buka Jivara sebagai PWA untuk menyimpan pengaturan notifikasi.
        </p>
      )}
      <div className="flex justify-end pt-2">
        <Button type="submit" icon={<Save size={18} />} loading={isSaving} disabled={!isStandalonePwa}>Simpan</Button>
      </div>
    </form>
  );
}
