import { Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthRequest } from "../../src/middleware/auth.middleware";

const service = vi.hoisted(() => ({
  createMedicationLog: vi.fn(),
  listMedicationLogs: vi.fn(),
  snoozeMedicationReminder: vi.fn(),
}));

vi.mock("../../src/services/medication-log.service", () => service);

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
}) as unknown as Response;

describe("medication log controller", async () => {
  const controller = await import("../../src/controllers/medication-log.controller");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns confirmation copy for confirmed logs", async () => {
    service.createMedicationLog.mockResolvedValue({ id: "log-id" });
    const req = { body: { status: "confirmed" }, user: { id: "patient-id", email: "patient@jivara.test", role: "patient" } } as unknown as AuthRequest;
    const res = createResponse();

    await controller.createMedicationLog(req, res);

    expect(service.createMedicationLog).toHaveBeenCalledWith(req.body, req.user);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ status: "berhasil", data: { id: "log-id" }, message: "Obat dikonfirmasi. Terima kasih! [DONE]" });
  });

  it("returns paginated medication logs", async () => {
    service.listMedicationLogs.mockResolvedValue({ data: [{ id: "log-id" }], meta: { total: 1 } });
    const req = { query: { patient_id: "patient-id" }, user: { id: "nurse-id", email: "nurse@jivara.test", role: "nurse" } } as unknown as AuthRequest;
    const res = createResponse();

    await controller.listMedicationLogs(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: "berhasil", data: [{ id: "log-id" }], meta: { total: 1 } });
  });

  it("returns snooze success responses", async () => {
    service.snoozeMedicationReminder.mockResolvedValue({ reminderJobId: "job-id" });
    const req = { body: { minutes: 20 }, user: { id: "patient-id", email: "patient@jivara.test", role: "patient" } } as unknown as AuthRequest;
    const res = createResponse();

    await controller.snoozeMedicationReminder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ status: "berhasil", data: { reminderJobId: "job-id" }, message: "Reminder berhasil ditunda" });
  });

  it("masks internal service errors", async () => {
    service.createMedicationLog.mockRejectedValue(new Error("database failure"));
    const req = { body: { status: "missed" }, user: { id: "patient-id", email: "patient@jivara.test", role: "patient" } } as unknown as AuthRequest;
    const res = createResponse();

    await controller.createMedicationLog(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: "gagal", message: "Terjadi kesalahan pada server" });
  });
});
