import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../db";
import { medicationLogs, medicationSchedules, notifications } from "../db/schema";
import * as notificationService from "./notification.service";

const schedulerIntervalMs = Number(process.env.REMINDER_SCHEDULER_INTERVAL_MS || 60_000);
const reminderWindowMs = Number(process.env.REMINDER_WINDOW_MS || 60_000);
const urgentEscalationMs = Number(process.env.REMINDER_URGENT_AFTER_MS || 30 * 60_000);
const criticalEscalationMs = Number(process.env.REMINDER_CRITICAL_AFTER_MS || 60 * 60_000);

let schedulerStarted = false;

const buildDoseTime = (baseDate: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const doseTime = new Date(baseDate);
  doseTime.setHours(hours, minutes, 0, 0);
  return doseTime;
};

const getDoseTimesForScheduler = (now: Date, scheduledTimes: unknown) => {
  if (!Array.isArray(scheduledTimes)) return [];

  const dates = [new Date(now)];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  dates.push(yesterday);

  return dates.flatMap((date) => scheduledTimes
    .filter((time): time is string => typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    .map((time) => buildDoseTime(date, time)));
};

const notificationExists = async (type: string, patientId: string, scheduleId: string, scheduledTime: Date) => {
  const existing = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(
      eq(notifications.patientId, patientId),
      eq(notifications.type, type),
      sql`${notifications.data}->>'schedule_id' = ${scheduleId}`,
      sql`${notifications.data}->>'scheduled_time' = ${scheduledTime.toISOString()}`,
    ))
    .limit(1);

  return existing.length > 0;
};

const hasLogStatus = async (scheduleId: string, scheduledTime: Date, statuses: string[]) => {
  const existing = await db
    .select({ id: medicationLogs.id })
    .from(medicationLogs)
    .where(and(
      eq(medicationLogs.scheduleId, scheduleId),
      eq(medicationLogs.scheduledTime, scheduledTime),
      or(...statuses.map((status) => eq(medicationLogs.status, status))),
    ))
    .limit(1);

  return existing.length > 0;
};

const createReminder = async (schedule: typeof medicationSchedules.$inferSelect, scheduledTime: Date) => {
  if (await notificationExists("medication_reminder", schedule.patientId, schedule.id, scheduledTime)) return;

  await notificationService.sendNotification({
    patientId: schedule.patientId,
    type: "medication_reminder",
    title: "Saatnya minum obat",
    body: `${schedule.drugName} ${schedule.dosage}${schedule.instructions ? ` - ${schedule.instructions}` : ""}`,
    urgency: "normal",
    scheduledAt: scheduledTime.toISOString(),
    data: {
      schedule_id: schedule.id,
      scheduled_time: scheduledTime.toISOString(),
      drug_name: schedule.drugName,
      dosage: schedule.dosage,
      action_url: "/medications/confirm",
    },
  });
};

const createEscalation = async (
  schedule: typeof medicationSchedules.$inferSelect,
  scheduledTime: Date,
  type: "escalation_urgent" | "escalation_critical",
) => {
  if (await notificationExists(type, schedule.patientId, schedule.id, scheduledTime)) return;

  const isCritical = type === "escalation_critical";

  await notificationService.sendNotification({
    patientId: schedule.patientId,
    type,
    title: isCritical ? "Obat belum dikonfirmasi" : "Pengingat ulang obat",
    body: isCritical
      ? `${schedule.drugName} ${schedule.dosage} belum dikonfirmasi lebih dari 60 menit.`
      : `${schedule.drugName} ${schedule.dosage} belum dikonfirmasi. Mohon cek pasien.`,
    urgency: isCritical ? "critical" : "urgent",
    scheduledAt: new Date().toISOString(),
    data: {
      schedule_id: schedule.id,
      scheduled_time: scheduledTime.toISOString(),
      drug_name: schedule.drugName,
      dosage: schedule.dosage,
      action_url: "/dashboard/patients",
    },
  });
};

const createMissedLog = async (schedule: typeof medicationSchedules.$inferSelect, scheduledTime: Date) => {
  const alreadyFinal = await hasLogStatus(schedule.id, scheduledTime, ["confirmed", "missed"]);
  if (alreadyFinal) return;

  await db.insert(medicationLogs).values({
    scheduleId: schedule.id,
    patientId: schedule.patientId,
    scheduledTime,
    status: "missed",
    snoozeCount: 0,
  });
};

export const runReminderSchedulerTick = async () => {
  const now = new Date();
  const schedules = await db
    .select()
    .from(medicationSchedules)
    .where(eq(medicationSchedules.isActive, true));

  for (const schedule of schedules) {
    const doseTimes = getDoseTimesForScheduler(now, schedule.scheduledTimes);

    for (const doseTime of doseTimes) {
      const ageMs = now.getTime() - doseTime.getTime();
      if (ageMs < 0) continue;

      if (ageMs <= reminderWindowMs) {
        await createReminder(schedule, doseTime);
      }

      if (ageMs >= urgentEscalationMs) {
        const confirmed = await hasLogStatus(schedule.id, doseTime, ["confirmed"]);
        if (!confirmed) {
          await createMissedLog(schedule, doseTime);
          await createEscalation(schedule, doseTime, "escalation_urgent");
        }
      }

      if (ageMs >= criticalEscalationMs) {
        const confirmed = await hasLogStatus(schedule.id, doseTime, ["confirmed"]);
        if (!confirmed) {
          await createEscalation(schedule, doseTime, "escalation_critical");
        }
      }
    }
  }
};

export const startReminderScheduler = () => {
  if (schedulerStarted || process.env.DISABLE_REMINDER_SCHEDULER === "true") return;
  schedulerStarted = true;

  void runReminderSchedulerTick().catch(() => undefined);
  setInterval(() => {
    void runReminderSchedulerTick().catch(() => undefined);
  }, schedulerIntervalMs);
};
