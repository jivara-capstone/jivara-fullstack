import { Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthRequest } from "../../src/middleware/auth.middleware";

const service = vi.hoisted(() => ({
  listPatients: vi.fn(),
  getPatientById: vi.fn(),
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  assignPatient: vi.fn(),
  deactivatePatient: vi.fn(),
}));

vi.mock("../../src/services/patient.service", () => service);

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
}) as unknown as Response;

describe("patient controller", async () => {
  const controller = await import("../../src/controllers/patient.controller");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated patients", async () => {
    service.listPatients.mockResolvedValue({ data: [{ id: "patient-id" }], meta: { page: 1 } });
    const req = { query: { page: "1" }, user: { id: "admin-id", email: "admin@jivara.test", role: "admin" } } as unknown as AuthRequest;
    const res = createResponse();

    await controller.listPatients(req, res);

    expect(service.listPatients).toHaveBeenCalledWith(req.query, req.user);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: "berhasil", data: [{ id: "patient-id" }], meta: { page: 1 } });
  });

  it("creates patients with a 201 response", async () => {
    service.createPatient.mockResolvedValue({ id: "patient-id" });
    const req = { body: { fullName: "Patient" }, user: { id: "admin-id", email: "admin@jivara.test", role: "admin" } } as unknown as AuthRequest;
    const res = createResponse();

    await controller.createPatient(req, res);

    expect(service.createPatient).toHaveBeenCalledWith(req.body, "admin-id");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: "berhasil", data: { id: "patient-id" } }));
  });

  it("passes safe client errors through", async () => {
    service.getPatientById.mockRejectedValue({ status: 404, message: "Pasien tidak ditemukan", code: "PATIENT_NOT_FOUND" });
    const req = { params: { id: "missing-id" }, user: { id: "admin-id", email: "admin@jivara.test", role: "admin" } } as unknown as AuthRequest;
    const res = createResponse();

    await controller.getPatient(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: "gagal", message: "Pasien tidak ditemukan", error_code: "PATIENT_NOT_FOUND" });
  });

  it("masks internal errors", async () => {
    service.updatePatient.mockRejectedValue(new Error("database leaked details"));
    const req = { params: { id: "patient-id" }, body: {}, user: { id: "admin-id", email: "admin@jivara.test", role: "admin" } } as unknown as AuthRequest;
    const res = createResponse();

    await controller.updatePatient(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: "gagal", message: "Terjadi kesalahan pada server" });
  });
});
