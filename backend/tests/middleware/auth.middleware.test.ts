import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthRequest, authenticateToken, authorizeRoles } from "../../src/middleware/auth.middleware";

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
}) as unknown as Response;

const createRequest = (authorization?: string, cookie?: string) => ({
  headers: {
    ...(authorization ? { authorization } : {}),
    ...(cookie ? { cookie } : {}),
  },
}) as AuthRequest;

describe("auth middleware", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("rejects requests without access token", () => {
    const req = createRequest();
    const res = createResponse();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error_code: "MISSING_TOKEN" }));
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts Bearer tokens and attaches decoded user", () => {
    const token = jwt.sign({ id: "user-id", email: "user@jivara.test", role: "patient" }, process.env.JWT_SECRET as string);
    const req = createRequest(`Bearer ${token}`);
    const res = createResponse();

    authenticateToken(req, res, next);

    expect(req.user).toMatchObject({ id: "user-id", email: "user@jivara.test", role: "patient" });
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("accepts cookie tokens", () => {
    const token = jwt.sign({ id: "cookie-user", email: "cookie@jivara.test", role: "admin" }, process.env.JWT_SECRET as string);
    const req = createRequest(undefined, `jivara-token=${encodeURIComponent(token)}`);
    const res = createResponse();

    authenticateToken(req, res, next);

    expect(req.user).toMatchObject({ id: "cookie-user", role: "admin" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects invalid tokens", () => {
    const req = createRequest("Bearer invalid-token");
    const res = createResponse();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error_code: "INVALID_TOKEN" }));
    expect(next).not.toHaveBeenCalled();
  });

  it("authorizes allowed roles", () => {
    const req = { user: { id: "user-id", email: "admin@jivara.test", role: "admin" } } as AuthRequest;
    const res = createResponse();

    authorizeRoles("admin")(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("normalizes superadmin role aliases", () => {
    const req = { user: { id: "user-id", email: "super@jivara.test", role: "superadmin" } } as AuthRequest;
    const res = createResponse();

    authorizeRoles("super_admin")(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("blocks disallowed roles", () => {
    const req = { user: { id: "user-id", email: "patient@jivara.test", role: "patient" } } as AuthRequest;
    const res = createResponse();

    authorizeRoles("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error_code: "FORBIDDEN" }));
    expect(next).not.toHaveBeenCalled();
  });
});
