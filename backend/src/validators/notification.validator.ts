import { Request, Response, NextFunction } from "express";

const isMissing = (value: unknown) =>
  value === undefined || value === null || (typeof value === "string" && !value.trim());

const isValidUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);

export const validatePushSubscribe = (req: Request, res: Response, next: NextFunction) => {
  const { patientId, subscription } = req.body;

  if (isMissing(patientId) || !isValidUuid(patientId)) {
    return res.status(400).json({ status: "gagal", message: "patientId wajib berupa UUID valid", error_code: "VALIDATION_ERROR" });
  }

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ status: "gagal", message: "Subscription push tidak lengkap", error_code: "VALIDATION_ERROR" });
  }

  next();
};

export const validateNotificationSend = (req: Request, res: Response, next: NextFunction) => {
  const { patientId, type, title, body, urgency } = req.body;

  if (isMissing(patientId) || !isValidUuid(patientId)) {
    return res.status(400).json({ status: "gagal", message: "patientId wajib berupa UUID valid", error_code: "VALIDATION_ERROR" });
  }

  if (isMissing(type) || isMissing(title) || isMissing(body)) {
    return res.status(400).json({ status: "gagal", message: "type, title, dan body wajib diisi", error_code: "VALIDATION_ERROR" });
  }

  if (urgency && !["normal", "urgent", "critical", "high"].includes(urgency)) {
    return res.status(400).json({ status: "gagal", message: "urgency tidak valid", error_code: "VALIDATION_ERROR" });
  }

  next();
};

export const validateNotificationId = (req: Request, res: Response, next: NextFunction) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id || !isValidUuid(id)) {
    return res.status(400).json({ status: "gagal", message: "ID notifikasi wajib berupa UUID valid", error_code: "VALIDATION_ERROR" });
  }

  next();
};
