import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/patients/",
        "/schedule/",
        "/food-scan/",
        "/settings/",
        "/activity-log/",
      ],
    },
    sitemap: "https://www.jivara.web.id/sitemap.xml",
  };
}
