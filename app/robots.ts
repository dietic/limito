import { config } from "@/lib/config";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const host = config.appUrl.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api", "/dashboard", "/links", "/settings", "/r/"],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
