import api from "@/lib/axios";
import type { MedicationScheduleRecord } from "@/lib/mocks/schedules";
import { getPatientsFromApi } from "@/lib/patientApi";
import type { PatientRecord } from "@/lib/mocks/patients";
import type { ScheduleMedicineFormValues } from "@/components/schedule/ScheduleForm";

interface ScheduleResponse {
  id: string;
  patientId: string;
  drugName: string;
  dosage: string;
  frequency: number;
  scheduledTimes: unknown;
  instructions?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
}

interface SingleScheduleResponse {
  data: ScheduleResponse;
}

const schedulesCacheTtl = 15_000;
let schedulesCache: { data: MedicationScheduleRecord[]; expiresAt: number } | null = null;
let schedulesRequest: Promise<MedicationScheduleRecord[]> | null = null;

export const clearSchedulesCache = () => {
  schedulesCache = null;
  schedulesRequest = null;
};

const getScheduledTimes = (value: unknown) => Array.isArray(value)
  ? value.filter((time): time is string => typeof time === "string")
  : [];

const getFrequencyNumber = (value: string) => {
  const match = value.match(/\d+/);
  const parsed = match ? Number(match[0]) : 1;
  return Math.min(Math.max(Number.isInteger(parsed) ? parsed : 1, 1), 3);
};

const mapSchedule = (schedule: ScheduleResponse, patient?: PatientRecord): MedicationScheduleRecord => ({
  id: schedule.id,
  patientId: schedule.patientId,
  patientName: patient?.name ?? "Pasien tidak diketahui",
  patientAvatar: patient?.avatar ?? "PX",
  medicineName: schedule.drugName,
  dose: schedule.dosage,
  medicineForm: "Tablet",
  stock: 0,
  frequency: `${schedule.frequency} kali sehari`,
  times: getScheduledTimes(schedule.scheduledTimes),
  mealRule: "Tidak tergantung makan",
  startDate: schedule.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  reminderEnabled: Boolean(schedule.isActive),
  instructions: schedule.instructions ?? undefined,
  status: schedule.isActive === false ? "Nonaktif" : "Aktif",
});

const mapMedicinePayload = (patientId: string, medicine: ScheduleMedicineFormValues, isActive = true) => ({
  patientId,
  drugName: medicine.medicineName,
  dosage: medicine.dose,
  frequency: getFrequencyNumber(medicine.frequency),
  scheduledTimes: [...medicine.times],
  instructions: medicine.instructions || null,
  isActive,
});

export const getSchedulesFromApi = async (providedPatients?: readonly PatientRecord[]): Promise<MedicationScheduleRecord[]> => {
  if (!providedPatients) {
    const now = Date.now();
    if (schedulesCache && schedulesCache.expiresAt > now) return schedulesCache.data;
    if (schedulesRequest) return schedulesRequest;
  }

  const request = Promise.all([
    api.get<{ data: ScheduleResponse[] }>("/medication-schedules"),
    providedPatients ? Promise.resolve(providedPatients) : getPatientsFromApi(),
  ]).then(([scheduleResponse, patients]) => {
    const patientById = new Map(patients.map((patient) => [patient.id, patient]));
    const schedules = scheduleResponse.data.data.map((schedule) => mapSchedule(schedule, patientById.get(schedule.patientId)));
    if (!providedPatients) schedulesCache = { data: schedules, expiresAt: Date.now() + schedulesCacheTtl };
    return schedules;
  });

  if (providedPatients) return request;

  schedulesRequest = request.finally(() => {
    schedulesRequest = null;
  });

  return schedulesRequest;
};

export const createSchedulesViaApi = async (patientId: string, medicines: readonly ScheduleMedicineFormValues[], patients: readonly PatientRecord[]) => {
  const patientById = new Map(patients.map((patient) => [patient.id, patient]));
  const responses = await Promise.all(medicines.map((medicine) => api.post<SingleScheduleResponse>("/medication-schedules", mapMedicinePayload(patientId, medicine, medicine.status !== "Nonaktif"))));
  clearSchedulesCache();
  return responses.map((response) => mapSchedule(response.data.data, patientById.get(response.data.data.patientId)));
};

export const updateScheduleViaApi = async (scheduleId: string, patientId: string, medicine: ScheduleMedicineFormValues, patients: readonly PatientRecord[]) => {
  const patientById = new Map(patients.map((patient) => [patient.id, patient]));
  const response = await api.put<SingleScheduleResponse>(`/medication-schedules/${encodeURIComponent(scheduleId)}`, mapMedicinePayload(patientId, medicine, medicine.status !== "Nonaktif"));
  clearSchedulesCache();
  return mapSchedule(response.data.data, patientById.get(response.data.data.patientId));
};

export const setScheduleActiveViaApi = async (schedule: MedicationScheduleRecord, isActive: boolean, patients: readonly PatientRecord[]) => {
  const patientById = new Map(patients.map((patient) => [patient.id, patient]));
  const response = await api.put<SingleScheduleResponse>(`/medication-schedules/${encodeURIComponent(schedule.id)}`, { isActive });
  clearSchedulesCache();
  return mapSchedule(response.data.data, patientById.get(response.data.data.patientId));
};

export const deactivateScheduleViaApi = async (scheduleId: string) => {
  await api.delete(`/medication-schedules/${encodeURIComponent(scheduleId)}`);
  clearSchedulesCache();
};
