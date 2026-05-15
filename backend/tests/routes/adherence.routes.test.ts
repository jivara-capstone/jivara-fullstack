import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/middleware/auth.middleware", () => ({
  authenticateToken: (req: Request & { user?: { id: string; email: string; role: string } }, _res: Response, next: NextFunction) => {
    req.user = {
      id: "patient-user-id",
      email: "patient@jivara.test",
      role: String(req.headers["x-test-role"] || "patient"),
    };
    next();
  },
  authorizeRoles: (...roles: string[]) => (req: Request & { user?: { role: string } }, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "gagal",
        message: "Anda tidak memiliki izin untuk mengakses sumber daya ini",
        error_code: "FORBIDDEN",
      });
    }

    next();
  },
}));

const getAdherence = vi.fn((_req: Request, res: Response) => res.status(200).json({ status: "berhasil", data: {} }));
const getAggregateAdherence = vi.fn((_req: Request, res: Response) => res.status(200).json({ status: "berhasil", data: {} }));

vi.mock("../../src/controllers/adherence.controller", () => ({
  getAdherence,
  getAggregateAdherence,
}));

describe("adherence routes", async () => {
  const { default: adherenceRoutes } = await import("../../src/routes/adherence.routes");
  const app = express().use("/adherence", adherenceRoutes);

  beforeEach(() => {
    getAdherence.mockClear();
    getAggregateAdherence.mockClear();
  });

  it("allows patient role to read adherence stats", async () => {
    await request(app).get("/adherence").set("x-test-role", "patient").expect(200);

    expect(getAdherence).toHaveBeenCalledOnce();
  });

  it("keeps aggregate adherence restricted from patient role", async () => {
    const response = await request(app).get("/adherence/aggregate").set("x-test-role", "patient").expect(403);

    expect(response.body).toMatchObject({ error_code: "FORBIDDEN" });
    expect(getAggregateAdherence).not.toHaveBeenCalled();
  });
});
