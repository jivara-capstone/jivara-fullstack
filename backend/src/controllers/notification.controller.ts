import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as notificationService from "../services/notification.service";

const sendError = (res: Response, error: unknown) => {
  const err = error as { status?: number; message?: string; code?: string };
  const status = err.status || 500;

  return res.status(status).json({
    status: "gagal",
    message: status >= 500 ? "Terjadi kesalahan pada server" : (err.message || "Terjadi kesalahan"),
    ...(err.code && { error_code: err.code }),
  });
};

export const subscribe = async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await notificationService.subscribe(req.body, req.headers["user-agent"]);
    res.status(201).json({ status: "berhasil", data: subscription, message: "Push subscription berhasil didaftarkan" });
  } catch (error) {
    sendError(res, error);
  }
};

export const send = async (req: AuthRequest, res: Response) => {
  try {
    const result = await notificationService.sendNotification(req.body);
    res.status(201).json({ status: "berhasil", data: result, message: "Notifikasi berhasil dibuat" });
  } catch (error) {
    sendError(res, error);
  }
};

export const list = async (req: AuthRequest, res: Response) => {
  try {
    const result = await notificationService.listNotifications(req.query);
    res.status(200).json({ status: "berhasil", data: result.data, meta: result.meta });
  } catch (error) {
    sendError(res, error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const notification = await notificationService.markAsRead(id);
    res.status(200).json({ status: "berhasil", data: notification, message: "Notifikasi ditandai sudah dibaca" });
  } catch (error) {
    sendError(res, error);
  }
};
