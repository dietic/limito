import { env } from "./env";

export const reservedSlugs = new Set([
  "admin",
  "api",
  "r",
  "login",
  "signup",
  "settings",
  "dashboard",
  "terms",
  "privacy",
  "pricing",
  "docs",
  "support",
  "www",
  "static",
  "assets",
]);

export const config = {
  appUrl: env.APP_URL,
  slugs: {
    autoLength: 7,
    customMin: 3,
    customMax: 30,
    pattern: /^[a-z0-9-]+$/,
  },
  rateLimit: {
    createPerUserPerDay: 20,
    redirectsPerIpPerMin: 60,
    globalPerSlugPerMin: 500,
  },
  plans: {
    free: {
      maxActiveLinks: Number(process.env["FREE_PLAN_MAX_ACTIVE_LINKS"] ?? 3),
      dailyCreations: Number(process.env["FREE_PLAN_DAILY_CREATIONS"] ?? 10),
      analyticsRetentionDays: Number(
        process.env["FREE_PLAN_ANALYTICS_RETENTION_DAYS"] ?? 7
      ),
    },
    // Defaults are conservative; override via env in production
    plus: {
      maxActiveLinks: Number(process.env["PLUS_PLAN_MAX_ACTIVE_LINKS"] ?? 25),
      dailyCreations: Number(process.env["PLUS_PLAN_DAILY_CREATIONS"] ?? 200),
      analyticsRetentionDays: Number(
        process.env["PLUS_PLAN_ANALYTICS_RETENTION_DAYS"] ?? 90
      ),
    },
    pro: {
      maxActiveLinks: Number(process.env["PRO_PLAN_MAX_ACTIVE_LINKS"] ?? 100),
      dailyCreations: Number(process.env["PRO_PLAN_DAILY_CREATIONS"] ?? 1000),
      analyticsRetentionDays: Number(
        process.env["PRO_PLAN_ANALYTICS_RETENTION_DAYS"] ?? 365
      ),
    },
  },
};
