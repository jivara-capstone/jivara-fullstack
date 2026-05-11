import { afterEach, describe, expect, it, vi } from "vitest";
import { dataUrlToFile, getCameraErrorMessage, getCameraLabel, getPreferredCameraId, getVideoConstraints, queryCameraPermission, requestCameraAccess } from "@/helpers/foodScanCamera";

const makeDevice = (deviceId: string, label: string): Pick<MediaDeviceInfo, "deviceId" | "label"> => ({ deviceId, label });

describe("food scan camera helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prefers an environment/back camera when devices are available", () => {
    expect(getPreferredCameraId([
      makeDevice("front", "HP True Vision FHD Camera"),
      makeDevice("back", "Rear Camera"),
    ])).toBe("back");
  });

  it("falls back to first camera and generated labels", () => {
    expect(getPreferredCameraId([makeDevice("first", "")])).toBe("first");
    expect(getCameraLabel({ label: "" }, 1)).toBe("Kamera 2");
  });

  it("builds constraints for selected camera or environment fallback", () => {
    expect(getVideoConstraints("camera-1")).toMatchObject({ deviceId: { exact: "camera-1" }, width: { ideal: 1280 }, height: { ideal: 720 } });
    expect(getVideoConstraints(null)).toMatchObject({ facingMode: { ideal: "environment" } });
  });

  it("maps browser camera errors to user-facing messages", () => {
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    expect(getCameraErrorMessage(new DOMException("denied", "NotAllowedError"))).toContain("Izin kamera diblokir");
    expect(getCameraErrorMessage(new DOMException("missing", "NotFoundError"))).toContain("Kamera tidak ditemukan");
  });

  it("converts camera screenshot data url into a File", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ blob: () => Promise.resolve(new Blob(["image"], { type: "image/jpeg" })) }));

    const file = await dataUrlToFile("data:image/jpeg;base64,aW1hZ2U=", "food.jpg");

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("food.jpg");
    expect(file.type).toBe("image/jpeg");
  });

  it("queries camera permission when browser supports permissions API", async () => {
    const query = vi.fn().mockResolvedValue({ state: "granted" });
    Object.defineProperty(navigator, "permissions", { value: { query }, configurable: true });

    await expect(queryCameraPermission()).resolves.toBe("granted");
    expect(query).toHaveBeenCalledWith({ name: "camera" });
  });

  it("requests camera access and stops temporary tracks", async () => {
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    const stop = vi.fn();
    const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] });
    Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia }, configurable: true });

    await requestCameraAccess();

    expect(getUserMedia).toHaveBeenCalledWith(expect.objectContaining({ audio: false }));
    expect(stop).toHaveBeenCalled();
  });
});
