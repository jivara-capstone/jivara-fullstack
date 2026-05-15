import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as activityReadService from "../services/activity-read.service";

const sendError = (res: Response, error: unknown) => {
  const err = error as { status?: number; message?: string; code?: string };
  const status = err.status || 500;
  return res.status(status).json({
    status: "gagal",
    message: status >= 500 ? "Terjadi kesalahan pada server" : (err.message || "Terjadi kesalahan"),
    ...(err.code && { error_code: err.code }),
  });
};

export const listActivityReads = async (req: AuthRequest, res: Response) => {
  try {
    const reads = await activityReadService.listActivityReads(req.user!.id);
    res.status(200).json({ status: "berhasil", data: reads });
  } catch (error) {
    sendError(res, error);
  }
};

export const markActivitiesRead = async (req: AuthRequest, res: Response) => {
  try {
    const reads = await activityReadService.markActivitiesRead(req.user!.id, req.body.activityIds);
    res.status(200).json({ status: "berhasil", data: reads, message: "Aktivitas ditandai sudah dibaca" });
  } catch (error) {
    sendError(res, error);
  }
};
