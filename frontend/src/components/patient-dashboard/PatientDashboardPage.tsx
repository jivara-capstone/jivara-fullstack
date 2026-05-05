"use client";

import { BellRing, Pill, ShieldCheck } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DashboardPageShell from "@/components/dashboard/DashboardPageShell";
import SummaryCardGrid from "@/components/ui/SummaryCardGrid";
import type { SummaryCardItem } from "@/components/ui/SummaryCard";
import { patients } from "@/lib/mocks/patients";
import { medicationSchedules } from "@/lib/mocks/schedules";
import { showConfirm, showToast } from "@/lib/swal";
import { usePatientDashboardStore } from "@/store/patientDashboard";
import PatientNextMedicineCard from "./PatientNextMedicineCard";
import PatientTodayStatusCard from "./PatientTodayStatusCard";

const mockPatient = patients[0];

export default function PatientDashboardPage() {
  const greeting = getGreeting();
  const patientSchedules = medicationSchedules.filter((schedule) => schedule.patientId === mockPatient.id);
  const activeSchedules = patientSchedules.filter((schedule) => schedule.status === "Aktif");
  const nextSchedule = activeSchedules[0] ?? patientSchedules[0];
  const lastScan = usePatientDashboardStore((state) => state.lastScan);
  const confirmedMedicineIds = usePatientDashboardStore((state) => state.confirmedMedicineIds);
  const confirmMedicine = usePatientDashboardStore((state) => state.confirmMedicine);
  const hasConfirmedNextMedicine = Boolean(nextSchedule && confirmedMedicineIds.includes(nextSchedule.id));

  const stats: SummaryCardItem[] = [
    {
      label: "Kepatuhan Saya",
      value: `${mockPatient.adherence}%`,
      helper: mockPatient.status,
      tone: mockPatient.adherence >= 80 ? "safe" : mockPatient.adherence >= 60 ? "warning" : "critical",
      color: "pine",
      icon: ShieldCheck,
      progress: mockPatient.adherence,
    },
    {
      label: "Obat Aktif",
      value: `${activeSchedules.length}`,
      tone: "safe",
      color: "leaf",
      icon: Pill,
    },
    {
      label: "Reminder Aktif",
      value: `${activeSchedules.filter((schedule) => schedule.reminderEnabled).length}`,
      tone: lastScan ? "safe" : "warning",
      color: "lime",
      icon: BellRing,
    },
  ];

  const handleConfirmMedicine = async () => {
    if (!nextSchedule || !lastScan) return;

    if (lastScan.risk === "High Risk") {
      const result = await showConfirm(
        "Hasil scan berisiko",
        "Makanan terakhir berpotensi berinteraksi dengan obat. Ikuti rekomendasi AI sebelum melanjutkan.",
        "Tetap Konfirmasi",
      );

      if (!result.isConfirmed) return;
    }

    confirmMedicine(nextSchedule.id);
    showToast("Obat berhasil dikonfirmasi.", "success");
  };

  return (
    <DashboardPageShell>
      <DashboardPageHeader title={`${greeting}, ${mockPatient.name}`} />
      <SummaryCardGrid stats={stats} />

      <div className="mt-6 space-y-6">
        <PatientTodayStatusCard completed={lastScan ? 3 : 2} total={5} missed={lastScan?.risk === "High Risk" ? 1 : 0} />
        {nextSchedule && (
          <PatientNextMedicineCard
            schedule={nextSchedule}
            canConfirm={Boolean(lastScan)}
            confirmed={hasConfirmedNextMedicine}
            onConfirm={handleConfirmMedicine}
          />
        )}
      </div>
    </DashboardPageShell>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}
