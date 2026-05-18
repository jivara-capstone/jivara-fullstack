"use client";

import { useEffect, useState } from "react";
import { BellRing, Pill, ShieldCheck } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DashboardPageShell from "@/components/dashboard/DashboardPageShell";
import { ActivityDataSkeleton, SummaryCardsSkeleton } from "@/components/ui/PageSkeletons";
import SummaryCardGrid from "@/components/ui/SummaryCardGrid";
import type { SummaryCardItem } from "@/components/ui/SummaryCard";
import type { PatientRecord } from "@/lib/mocks/patients";
import type { MedicationScheduleRecord } from "@/lib/mocks/schedules";
import { getPatientDashboardData, type PatientAdherenceStatsResponse } from "@/lib/patientDashboardApi";
import { usePatientDashboardStore } from "@/store/patientDashboard";
import { useSplashScreen } from "@/components/ui/AppSplashScreen";
import PatientAdherenceHeatmap from "./PatientAdherenceHeatmap";

const initialPatient: PatientRecord = {
  id: "",
  name: "-",
  age: 0,
  gender: "Pria",
  status: "On Ideal Schedule",
  lastVisit: "-",
  adherence: 100,
  avatar: "PX",
};

const emptyAdherenceStats: PatientAdherenceStatsResponse = {
  adherenceRate: 0,
  totalScheduled: 0,
  dailyBreakdown: [],
};

export default function PatientDashboardPage() {
  const setPatientId = usePatientDashboardStore((state) => state.setPatientId);
  const { isSplashFinished } = useSplashScreen();
  const [patient, setPatient] = useState<PatientRecord>(initialPatient);
  const [patientSchedules, setPatientSchedules] = useState<MedicationScheduleRecord[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<PatientAdherenceStatsResponse>(emptyAdherenceStats);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getPatientDashboardData()
      .then((data) => {
        if (!isMounted) return;
        setHasLoadError(false);
        setPatient(data.patient);
        setPatientId(data.patient.id);
        setPatientSchedules(data.schedules);
        setAdherenceStats(data.adherenceStats);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasLoadError(true);
        setPatientId(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [setPatientId]);

  if (!isSplashFinished) return null;
  if (!isLoading && hasLoadError) {
    return (
      <DashboardPageShell>
        <DashboardPageHeader title="Dashboard Pasien" />
        <section className="mt-6 rounded-[32px] bg-white p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-bold text-muted">Data dashboard pasien belum bisa dimuat dari API.</p>
        </section>
      </DashboardPageShell>
    );
  }

  const greeting = getGreeting();
  const activeSchedules = patientSchedules.filter((schedule) => schedule.status === "Aktif");
  const heatmapAdherence = getAdherenceFromStats(adherenceStats);

  const stats: SummaryCardItem[] = [
    {
      label: "Obat Aktif Saya",
      value: `${activeSchedules.length}`,
      tone: "safe",
      color: "leaf",
      icon: Pill,
    },
    {
      label: "Reminder Obat Aktif",
      value: `${activeSchedules.filter((schedule) => schedule.reminderEnabled).length}`,
      tone: "safe",
      color: "lime",
      icon: BellRing,
    },
    {
      label: "Kepatuhan Keseluruhan Saya",
      value: `${heatmapAdherence}%`,
      helper: patient.status,
      tone: heatmapAdherence >= 80 ? "safe" : heatmapAdherence >= 60 ? "warning" : "critical",
      color: "pine",
      icon: ShieldCheck,
      progress: heatmapAdherence,
    }
  ];

  return (
    <DashboardPageShell>
      <DashboardPageHeader title={`${greeting}, ${patient.name}`} />
      {isLoading ? <SummaryCardsSkeleton /> : <SummaryCardGrid stats={stats} />}

      <div className="mt-6 space-y-6">
        {isLoading ? <ActivityDataSkeleton rows={5} /> : <PatientAdherenceHeatmap dailyBreakdown={adherenceStats.dailyBreakdown} />}
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

function getAdherenceFromStats(stats: PatientAdherenceStatsResponse) {
  const totalScheduled = stats.dailyBreakdown.reduce((sum, day) => sum + day.scheduled, 0);
  const totalConfirmed = stats.dailyBreakdown.reduce((sum, day) => sum + day.confirmed, 0);
  if (totalScheduled === 0) return 100;
  return Math.round((totalConfirmed / totalScheduled) * 100);
}
