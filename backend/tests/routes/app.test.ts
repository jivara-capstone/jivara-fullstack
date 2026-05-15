import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app";

describe("app routes", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({
      status: "Berjalan",
      message: "Backend Jivara berjalan dengan baik",
    });
  });

  it("returns API metadata from root route", async () => {
    const response = await request(app).get("/").expect(200);

    expect(response.body).toMatchObject({
      name: "Jivara API",
      version: "1.0.0",
      framework: "Express.js",
      status: "Berjalan",
      docs: "/api-docs",
    });
  });

  it("returns a consistent 404 response", async () => {
    const response = await request(app).get("/unknown-route").expect(404);

    expect(response.body).toEqual({
      status: "gagal",
      message: "Endpoint tidak ditemukan",
    });
  });
});
