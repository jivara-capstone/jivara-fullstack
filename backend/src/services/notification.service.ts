import { and, count, desc, eq, gte, lt } from "drizzle-orm";
import webPush from "web-push";
import { db } from "../db";
import { notifications, patients, pushSubscriptions } from "../db/schema";
import {
  NotificationListQuery,
  NotificationSendDTO,
  PushSubscriptionDTO,
} from "../types/notification.types";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@jivara.app",
    vapidPublicKey,
    vapidPrivateKey,
  );
}

const parsePagination = (query: NotificationListQuery) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

const getDateRange = (date?: string) => {
  if (!date) return null;

  const start = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const ensurePatientExists = async (patientId: string) => {
  const patient = await db.select({ id: patients.id }).from(patients).where(eq(patients.id, patientId)).limit(1);

  if (patient.length === 0) {
    throw { status: 404, message: "Pasien tidak ditemukan", code: "PATIENT_NOT_FOUND" };
  }
};

export const subscribe = async (dto: PushSubscriptionDTO, userAgent?: string) => {
  await ensurePatientExists(dto.patientId);

  const existing = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, dto.subscription.endpoint))
    .limit(1);

  if (existing.length > 0) {
    const [subscription] = await db
      .update(pushSubscriptions)
      .set({
        patientId: dto.patientId,
        p256dh: dto.subscription.keys.p256dh,
        auth: dto.subscription.keys.auth,
        userAgent: userAgent || null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(pushSubscriptions.id, existing[0].id))
      .returning();

    return subscription;
  }

  const [subscription] = await db
    .insert(pushSubscriptions)
    .values({
      patientId: dto.patientId,
      endpoint: dto.subscription.endpoint,
      p256dh: dto.subscription.keys.p256dh,
      auth: dto.subscription.keys.auth,
      userAgent: userAgent || null,
    })
    .returning();

  return subscription;
};

export const createNotification = async (dto: NotificationSendDTO, initialStatus = "pending") => {
  await ensurePatientExists(dto.patientId);

  const [notification] = await db
    .insert(notifications)
    .values({
      patientId: dto.patientId,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      data: dto.data || null,
      urgency: dto.urgency || "normal",
      status: initialStatus,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : new Date(),
    })
    .returning();

  return notification;
};

export const sendNotification = async (dto: NotificationSendDTO) => {
  const notification = await createNotification(dto);
  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(and(eq(pushSubscriptions.patientId, dto.patientId), eq(pushSubscriptions.isActive, true)));

  if (!vapidPublicKey || !vapidPrivateKey || subscriptions.length === 0) {
    return { notification, delivered: 0, failed: 0, skipped: true };
  }

  const payload = JSON.stringify({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: notification.data,
    urgency: notification.urgency,
  });

  let delivered = 0;
  let failed = 0;

  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webPush.sendNotification({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      }, payload);
      delivered += 1;
    } catch {
      failed += 1;
      await db
        .update(pushSubscriptions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(pushSubscriptions.id, subscription.id));
    }
  }));

  const nextStatus = delivered > 0 ? "delivered" : "failed";
  const [updated] = await db
    .update(notifications)
    .set({
      status: nextStatus,
      deliveredAt: delivered > 0 ? new Date() : null,
    })
    .where(eq(notifications.id, notification.id))
    .returning();

  return { notification: updated, delivered, failed, skipped: false };
};

export const listNotifications = async (query: NotificationListQuery) => {
  const { page, limit, offset } = parsePagination(query);
  const patientId = query.patientId || query.patient_id;
  const dateRange = getDateRange(query.date);
  const conditions = [];

  if (patientId) conditions.push(eq(notifications.patientId, patientId));
  if (query.type) conditions.push(eq(notifications.type, query.type));
  if (query.status) conditions.push(eq(notifications.status, query.status));
  if (dateRange) {
    conditions.push(gte(notifications.createdAt, dateRange.start));
    conditions.push(lt(notifications.createdAt, dateRange.end));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(notifications).where(where),
  ]);

  return {
    data: rows,
    meta: {
      page,
      limit,
      total: totalRows[0]?.total || 0,
    },
  };
};

export const markAsRead = async (id: string) => {
  const [notification] = await db
    .update(notifications)
    .set({ status: "read", readAt: new Date() })
    .where(eq(notifications.id, id))
    .returning();

  if (!notification) {
    throw { status: 404, message: "Notifikasi tidak ditemukan", code: "NOTIFICATION_NOT_FOUND" };
  }

  return notification;
};
