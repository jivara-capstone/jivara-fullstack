import api from "@/lib/axios";
import type { ActivityLogRecord } from "@/lib/mocks/activityLogs";

interface AlertResponse {
  id: string;
  patientId: string;
  patientName: string;
  scheduleId: string;
  drugName: string;
  dosage: string;
  scheduledTime: string;
  status: string;
  severity: "warning" | "critical";
  message: string;
  updatedAt?: string | null;
  createdAt?: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
}

const alertsCacheTtl = 10_000;
let alertsCache: { data: ActivityLogRecord[]; expiresAt: number } | null = null;
let alertsRequest: Promise<ActivityLogRecord[]> | null = null;

export const clearAlertsCache = () => {
  alertsCache = null;
  alertsRequest = null;
};

export const getAlertActivitiesFromApi = async (): Promise<ActivityLogRecord[]> => {
  const now = Date.now();
  if (alertsCache && alertsCache.expiresAt > now) return alertsCache.data;
  if (alertsRequest) return alertsRequest;

  alertsRequest = api.get<PaginatedResponse<AlertResponse>>("/alerts", { params: { limit: 100 } })
    .then((response) => {
      const activities = response.data.data.map((alert) => ({
        id: alert.id,
        title: alert.severity === "critical" ? "Kepatuhan kritis" : "Peringatan kepatuhan",
        description: alert.message,
        category: "Kepatuhan" as const,
        severity: alert.severity === "critical" ? "Kritis" as const : "Peringatan" as const,
        timestamp: alert.updatedAt || alert.createdAt || alert.scheduledTime,
        patientId: alert.patientId,
        patientName: alert.patientName,
        scheduleId: alert.scheduleId,
        medicineName: `${alert.drugName} ${alert.dosage}`,
        read: false,
      }));
      alertsCache = { data: activities, expiresAt: Date.now() + alertsCacheTtl };
      return activities;
    })
    .finally(() => {
      alertsRequest = null;
    });

  return alertsRequest;
};

export const resolveAlertViaApi = async (alertId: string) => {
  await api.patch(`/alerts/${encodeURIComponent(alertId)}/resolve`);
  clearAlertsCache();
};
