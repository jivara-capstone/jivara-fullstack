import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateLoginIdentifier, validateRegister } from "../../src/validators/auth.validator";

const createResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  return res;
};

const createRequest = (body: Record<string, unknown>, params: Record<string, string> = {}) => ({
  body,
  params,
}) as Request;

describe("auth validators", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("rejects register requests without full name", () => {
    const req = createRequest({
      organizationName: "RS Jivara",
      email: "admin@jivara.test",
      password: "password123",
    });
    const res = createResponse();

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "gagal",
      message: "Nama lengkap wajib diisi",
      error_code: "VALIDATION_ERROR",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects register requests with invalid email", () => {
    const req = createRequest({
      fullName: "Admin Jivara",
      organizationName: "RS Jivara",
      email: "invalid-email",
      password: "password123",
    });
    const res = createResponse();

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "gagal",
      message: "Format email tidak valid",
      error_code: "VALIDATION_ERROR",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects register requests with short passwords", () => {
    const req = createRequest({
      fullName: "Admin Jivara",
      organizationName: "RS Jivara",
      email: "admin@jivara.test",
      password: "secret",
    });
    const res = createResponse();

    validateRegister(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "gagal",
      message: "Kata sandi minimal harus 8 karakter",
      error_code: "VALIDATION_ERROR",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts valid register requests", () => {
    const req = createRequest({
      fullName: "Admin Jivara",
      organizationName: "RS Jivara",
      email: "admin@jivara.test",
      password: "password123",
    });
    const res = createResponse();

    validateRegister(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects login requests without identifier or email", () => {
    const req = createRequest({ password: "password123" });
    const res = createResponse();

    validateLoginIdentifier(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "gagal",
      message: "Email/nomor telepon wajib diisi",
      error_code: "VALIDATION_ERROR",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts login requests with identifier", () => {
    const req = createRequest({ identifier: "admin@jivara.test", password: "password123" });
    const res = createResponse();

    validateLoginIdentifier(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
