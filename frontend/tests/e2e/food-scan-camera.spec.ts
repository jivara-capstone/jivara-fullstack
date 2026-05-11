import { expect, test, type Page, type Route } from "@playwright/test";
import { gotoApp, loginAs } from "./helpers/auth";
import { mockCommonApi } from "./helpers/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "accept, authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

const fulfillJson = async (route: Route, json: unknown) => {
  if (route.request().method() === "OPTIONS") {
    await route.fulfill({ status: 204, headers: corsHeaders });
    return;
  }

  await route.fulfill({ headers: corsHeaders, json });
};

async function mockFoodScanApi(page: Page) {
  await page.route("**/api/food-scans**", async (route) => {
    const url = route.request().url();

    if (url.includes("/detections")) {
      await fulfillJson(route, {
        data: {
          scan_id: "scan-e2e",
          detected_items: [{ label: "nasi_putih", label_display: "Nasi Putih", confidence: 0.94 }],
          inference_time_ms: 120,
          model_version: "yolo-e2e",
          timestamp: "2026-05-09T08:00:00.000Z",
        },
      });
      return;
    }

    if (url.includes("/interactions")) {
      await fulfillJson(route, {
        data: {
          interactions: [],
          overall_risk_level: "rendah",
          overall_recommendation: "Tidak ditemukan interaksi signifikan.",
          disclaimer: "Tetap ikuti saran tenaga kesehatan.",
        },
      });
      return;
    }

    await fulfillJson(route, {
      data: {
        image_id: "scan-e2e",
        upload_url: "/uploads/scan-e2e.jpg",
        timestamp: "2026-05-09T08:00:00.000Z",
      },
    });
  });

  await page.route("**/api/nutrition-estimates", async (route) => {
    await fulfillJson(route, { data: [] });
  });
}

test("patient activates live food scan camera", async ({ context, page }) => {
  await loginAs(context, page, "patient");
  await context.grantPermissions(["camera"]);
  await mockCommonApi(page);
  await mockFoodScanApi(page);

  await gotoApp(page, "/food-scan");
  await page.getByRole("button", { name: /aktifkan kamera/i }).click();

  await expect(page.getByRole("button", { name: /scan sekarang/i })).toBeEnabled({ timeout: 15_000 });
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return Boolean(video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0);
  });
  await expect(page.getByText("Belum ada hasil scan")).toBeVisible();
});
