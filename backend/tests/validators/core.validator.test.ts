import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateMedicationLogCreate, validateMedicationSnooze } from "../../src/validators/medication-log.validator";
import { validateMedicationScheduleCreate, validateMedicationScheduleId, validateMedicationScheduleUpdate } from "../../src/validators/medication-schedule.validator";
import { validateAssignPatient, validatePatientCreate, validatePatientUpdate } from "../../src/validators/patient.validator";

const validUuid = "11111111-1111-4111-8111-111111111111";

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
}) as unknown as Response;

const createRequest = (body: Record<string, unknown> = {}, params: Record<string, string> = {}) => ({
  body,
  params,
}) as Request;

describe("core validators", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("accepts valid patient creation payloads", () => {
    const req = createRequest({ fullName: "Patient One", email: "patient@jivara.test", password: "password123", gender: "female", assignedNurseId: validUuid });
    const res = createResponse();

    validatePatientCreate(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects invalid patient creation emails", () => {
    const req = createRequest({ fullName: "Patient One", email: "invalid", password: "password123" });
    const res = createResponse();

    validatePatientCreate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error_code: "VALIDATION_ERROR" }));
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects invalid patient update genders", () => {
    const req = createRequest({ gender: "unknown" });
    const res = createResponse();

    validatePatientUpdate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("validates patient assignment nurse IDs", () => {
    const req = createRequest({ nurseId: validUuid });
    const res = createResponse();

    validateAssignPatient(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("accepts valid medication schedule creation payloads", () => {
    const req = createRequest({ patientId: validUuid, drugName: "Amlodipine", dosage: "5mg", frequency: 2, scheduledTimes: ["08:00", "20:00"] });
    const res = createResponse();

    validateMedicationScheduleCreate(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects invalid medication schedule times", () => {
    const req = createRequest({ patientId: validUuid, drugName: "Amlodipine", dosage: "5mg", frequency: 2, scheduledTimes: ["25:00"] });
    const res = createResponse();

    validateMedicationScheduleCreate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("validates medication schedule IDs", () => {
    const req = createRequest({}, { id: validUuid });
    const res = createResponse();

    validateMedicationScheduleId(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects invalid medication schedule update frequencies", () => {
    const req = createRequest({ frequency: 4 });
    const res = createResponse();

    validateMedicationScheduleUpdate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("normalizes snake case medication log payloads", () => {
    const req = createRequest({ schedule_id: validUuid, status: "confirmed", scheduled_time: "2026-05-15T08:00:00.000Z" });
    const res = createResponse();

    validateMedicationLogCreate(req, res, next);

    expect(req.body.scheduleId).toBe(validUuid);
    expect(req.body.scheduledTime).toBe("2026-05-15T08:00:00.000Z");
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects invalid medication log statuses", () => {
    const req = createRequest({ scheduleId: validUuid, status: "done" });
    const res = createResponse();

    validateMedicationLogCreate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("normalizes valid snooze payloads", () => {
    const req = createRequest({ reminder_job_id: validUuid, minutes: "20" });
    const res = createResponse();

    validateMedicationSnooze(req, res, next);

    expect(req.body.reminderJobId).toBe(validUuid);
    expect(req.body.minutes).toBe(20);
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects unsupported snooze durations", () => {
    const req = createRequest({ reminderJobId: validUuid, minutes: 15 });
    const res = createResponse();

    validateMedicationSnooze(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
