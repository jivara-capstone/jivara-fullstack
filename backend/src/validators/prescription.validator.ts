import { Request, Response, NextFunction } from "express";

const isMissing = (value: unknown) =>
  value === undefined || value === null || (typeof value === "string" && !value.trim());

const isValidUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const isValidDate = (value: string) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));

const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export const validatePrescriptionId = (req: Request, res: Response, next: NextFunction) => {
  const id = getParam(req.params.id);

  if (!id || !isValidUuid(id)) {
    return res.status(400).json({ status: "gagal", message: "ID resep wajib berupa UUID valid", error_code: "VALIDATION_ERROR" });
  }

  next();
};

export const validatePrescriptionCreate = (req: Request, res: Response, next: NextFunction) => {
  const { patientId, patient_id: patientIdSnake, startDate, start_date: startDateSnake, endDate, end_date: endDateSnake } = req.body;
  const resolvedPatientId = patientId || patientIdSnake;
  const resolvedStartDate = startDate || startDateSnake;
  const resolvedEndDate = endDate || endDateSnake;

  if (isMissing(resolvedPatientId) || !isValidUuid(resolvedPatientId)) {
    return res.status(400).json({ status: "gagal", message: "patientId wajib berupa UUID valid", error_code: "VALIDATION_ERROR" });
  }

  if (resolvedStartDate && !isValidDate(resolvedStartDate)) {
    return res.status(400).json({ status: "gagal", message: "startDate harus berupa tanggal valid", error_code: "VALIDATION_ERROR" });
  }

  if (resolvedEndDate && !isValidDate(resolvedEndDate)) {
    return res.status(400).json({ status: "gagal", message: "endDate harus berupa tanggal valid", error_code: "VALIDATION_ERROR" });
  }

  req.body.patientId = resolvedPatientId;
  req.body.startDate = resolvedStartDate;
  req.body.endDate = resolvedEndDate;
  next();
};

export const validatePrescriptionUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { startDate, start_date: startDateSnake, endDate, end_date: endDateSnake } = req.body;
  const resolvedStartDate = startDate || startDateSnake;
  const resolvedEndDate = endDate || endDateSnake;

  if (resolvedStartDate && !isValidDate(resolvedStartDate)) {
    return res.status(400).json({ status: "gagal", message: "startDate harus berupa tanggal valid", error_code: "VALIDATION_ERROR" });
  }

  if (resolvedEndDate && !isValidDate(resolvedEndDate)) {
    return res.status(400).json({ status: "gagal", message: "endDate harus berupa tanggal valid", error_code: "VALIDATION_ERROR" });
  }

  if (startDateSnake !== undefined) req.body.startDate = startDateSnake;
  if (endDateSnake !== undefined) req.body.endDate = endDateSnake;
  next();
};
