"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useEffect } from "react";

export default function WebVitals() {
  useReportWebVitals(() => {
    // Optionally log or send vitals to an analytics endpoint
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark("app-mounted-start");
      
      const timeoutId = setTimeout(() => {
        performance.mark("app-mounted-end");
        try {
          performance.measure("app-mount-duration", "app-mounted-start", "app-mounted-end");
        } catch (e) {
          console.error("Error creating performance measure:", e);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  return null;
}
