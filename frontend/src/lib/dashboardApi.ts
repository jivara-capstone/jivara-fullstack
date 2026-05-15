import { AlertTriangle, CalendarClock, CheckCircle2, UserRound, UsersRound } from "lucide-react";
import type { SummaryCardItem } from "@/components/ui/SummaryCard";
import api from "@/lib/axios";
import type { PatientRecord, PatientStatus } from "@/lib/mocks/patients";
import { getNursesFromApi } from "@/lib/nurseApi";

interface PatientListResponse {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  adherenceRate7d?: number | null;
  adherenceRate30d?: number | null;
  totalScheduled30d?: number | null;
}

interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total?: number;
  };
}

interface AlertResponse {
  id: string;
  patientId: string;
  status: string;
  severity: "warning" | "critical";
}

interface AggregateAdherenceResponse {
  totalActivePatients: number;
  averageAdherenceRate: number;
  totalScheduled: number;
}

interface AdherenceStatsResponse {
  adherenceRate: number;
  totalScheduled?: number;
}

export interface NurseDashboardData {
  stats: SummaryCardItem[];
  patients: PatientRecord[];
}

export interface AdminDashboardStatsData {
  stats: SummaryCardItem[];
}

const getAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return 0;

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed = today.getMonth() > birthDate.getMonth() || today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate();
  if (!hasBirthdayPassed) age -= 1;
  return Math.max(age, 0);
};

const getInitials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PX";

const getStatusFromAdherence = (adherence: number): PatientStatus => {
  if (adherence < 50) return "Need Special Attention";
  if (adherence < 75) return "Lagging Behind";
  return "On Ideal Schedule";
};

const mapPatient = (patient: PatientListResponse, adherence: number, status: PatientStatus): PatientRecord => ({
  id: patient.id,
  name: patient.fullName,
  age: getAge(patient.dateOfBirth),
  gender: patient.gender === "female" ? "Wanita" : "Pria",
  phone: patient.phone ?? undefined,
  email: patient.email ?? undefined,
  address: patient.address ?? undefined,
  status,
  lastVisit: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-",
  adherence,
  avatar: getInitials(patient.fullName),
});

const getPatientListAdherence = (patient: PatientListResponse) => {
  if (!patient.totalScheduled30d) return 100;
  return Math.round(patient.adherenceRate30d ?? patient.adherenceRate7d ?? 0);
};

const normalizeAdherence = (adherence: number | null | undefined, totalScheduled?: number | null) => {
  if (!totalScheduled) return 100;
  return Math.round(adherence ?? 0);
};

export const getNurseDashboardData = async (): Promise<NurseDashboardData> => {
  const [patientsResponse, alertsResponse, adherenceResponse] = await Promise.all([
    api.get<PaginatedResponse<PatientListResponse>>("/patients", { params: { limit: 5, status: "active" } }),
    api.get<PaginatedResponse<AlertResponse>>("/alerts", { params: { limit: 100 } }),
    api.get<{ data: AdherenceStatsResponse }>("/adherence", { params: { period: "30d" } }),
  ]);

  const alerts = alertsResponse.data.data;
  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical" || alert.status === "missed").length;
  const warningAlerts = Math.max(alerts.length - criticalAlerts, 0);
  const totalPatients = patientsResponse.data.meta?.total ?? patientsResponse.data.data.length;
  const patientAdherence = patientsResponse.data.data.map(getPatientListAdherence);
  const averageAdherenceRate = patientAdherence.length > 0
    ? Math.round(patientAdherence.reduce((total, adherence) => total + adherence, 0) / patientAdherence.length)
    : normalizeAdherence(adherenceResponse.data.data.adherenceRate, adherenceResponse.data.data.totalScheduled);
  const patients = patientsResponse.data.data.map((patient, index) => {
    const adherence = patientAdherence[index] ?? 0;
    return mapPatient(patient, adherence, getStatusFromAdherence(adherence));
  });

  return {
    stats: [
      { label: "Total Pasien Saya", value: String(totalPatients), helper: "", tone: "safe", color: "pine", icon: UsersRound },
      { label: "Notifikasi Peringatan Pasien", value: String(criticalAlerts), helper: warningAlerts > 0 ? `${warningAlerts} peringatan aktif` : "", tone: criticalAlerts > 0 ? "critical" : "safe", color: "lime", icon: AlertTriangle },
      { label: "Kepatuhan Pasien Keseluruhan", value: `${averageAdherenceRate}%`, helper: "Rata-rata 30 hari", tone: averageAdherenceRate >= 80 ? "safe" : averageAdherenceRate >= 60 ? "warning" : "critical", color: "leaf", icon: CheckCircle2, progress: averageAdherenceRate },
    ],
    patients,
  };
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStatsData> => {
  const [response, nurses] = await Promise.all([
    api.get<{ data: AggregateAdherenceResponse }>("/adherence/aggregate", { params: { period: "30d" } }),
    getNursesFromApi(),
  ]);
  const aggregate = response.data.data;

  return {
    stats: [
      { label: "Total Perawat Saya", value: String(nurses.length), tone: "neutral", color: "pine", icon: UsersRound },
      { label: "Total Pasien Saya", value: String(aggregate.totalActivePatients), tone: "safe", color: "leaf", icon: UserRound },
      { label: "Jadwal Pasien Aktif", value: String(aggregate.totalScheduled), tone: "neutral", color: "lime", icon: CalendarClock },
    ],
  };
};

export const emptyNurseDashboardData: NurseDashboardData = {
  stats: [],
  patients: [],
};
