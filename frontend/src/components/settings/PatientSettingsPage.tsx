"use client";

import { Bell, ShieldCheck, User } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DashboardPageShell from "@/components/dashboard/DashboardPageShell";
import PatientProfileSettingsForm from "./PatientProfileSettingsForm";
import PatientReminderSettingsForm from "./PatientReminderSettingsForm";
import SecuritySettingsForm from "./SecuritySettingsForm";
import SettingsCard from "./SettingsCard";

export default function PatientSettingsPage() {
  return (
    <DashboardPageShell>
      <DashboardPageHeader title="Pengaturan" delay={0.08} />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SettingsCard title="Profil Saya" icon={<User size={22} />} delay={0.14}>
          <PatientProfileSettingsForm />
        </SettingsCard>

        <SettingsCard title="Keamanan Akun" icon={<ShieldCheck size={22} />} delay={0.2}>
          <SecuritySettingsForm />
        </SettingsCard>
      </div>

      <SettingsCard className="mt-5" title="Reminder Obat" icon={<Bell size={22} />} delay={0.26}>
        <PatientReminderSettingsForm />
      </SettingsCard>
    </DashboardPageShell>
  );
}
