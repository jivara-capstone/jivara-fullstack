import { activityLogs, type ActivityCategory, type ActivityLogRecord } from "@/lib/mocks/activityLogs";
import { foodScans, type FoodScanRecord } from "@/lib/mocks/foodScans";
import { patients, type PatientRecord } from "@/lib/mocks/patients";
import { medicationSchedules, type MedicationScheduleRecord } from "@/lib/mocks/schedules";

export type AdherenceRange = 7 | 14 | 30;

export interface AdherenceTrendPoint {
  readonly label: string;
  readonly value: number;
}

export interface PatientDetailData {
  readonly patient: PatientRecord;
  readonly schedules: readonly MedicationScheduleRecord[];
  readonly activities: readonly ActivityLogRecord[];
  readonly scans: readonly FoodScanRecord[];
}

export function getPatientDetailData(patientId: string): PatientDetailData | null {
  const patient = patients.find((currentPatient) => currentPatient.id === patientId);
  if (!patient) return null;

  return {
    patient,
    schedules: medicationSchedules.filter((schedule) => schedule.patientId === patient.id),
    activities: activityLogs.filter((activity) => activity.patientId === patient.id).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    scans: foodScans.filter((scan) => scan.patientId === patient.id).sort((a, b) => Date.parse(b.scannedAt) - Date.parse(a.scannedAt)),
  };
}

export function getAdherenceTrend(patient: PatientRecord, range: AdherenceRange): AdherenceTrendPoint[] {
  const today = new Date();
  const seed = patient.id.split("").reduce((total, character) => total + character.charCodeAt(0), 0);

  return Array.from({ length: range }, (_, index) => {
    const daysFromStart = range - index - 1;
    const date = new Date(today);
    date.setDate(today.getDate() - daysFromStart);
    const wave = Math.sin((seed + index) * 0.74) * 7;
    const drift = ((index % 5) - 2) * 1.6;
    const value = clamp(Math.round(patient.adherence + wave + drift), 18, 100);

    return {
      label: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      value,
    };
  });
}

export function getActivityDistribution(activities: readonly ActivityLogRecord[]) {
  const categories: readonly ActivityCategory[] = ["Reminder", "Kepatuhan", "Scan Makanan"];

  return categories.map((category) => ({
    label: category,
    value: activities.filter((activity) => activity.category === category).length,
  }));
}

export function getPatientSummary(data: PatientDetailData) {
  const activeMedicineCount = data.schedules.filter((schedule) => schedule.status === "Aktif").length;
  const activeReminderCount = data.schedules.filter((schedule) => schedule.reminderEnabled).length;
  const criticalActivityCount = data.activities.filter((activity) => activity.severity === "Kritis").length;

  return {
    activeMedicineCount,
    activeReminderCount,
    criticalActivityCount,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
