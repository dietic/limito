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

function parseMaxLinks(envKey: string, fallback: number | typeof Infinity) {
  const raw = process.env[envKey];
  if (!raw || raw.trim().length === 0) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (["infinity", "inf", "unlimited"].includes(normalized)) {
    return Number.POSITIVE_INFINITY;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseRetention(envKey: string, fallback: number) {
  const raw = process.env[envKey];
  if (!raw || raw.trim().length === 0) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

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
      maxActiveLinks: parseMaxLinks("FREE_PLAN_MAX_ACTIVE_LINKS", 2),
      analyticsRetentionDays: parseRetention(
        "FREE_PLAN_ANALYTICS_RETENTION_DAYS",
        7
      ),
    },
    // Defaults are conservative; override via env in production
    plus: {
      maxActiveLinks: parseMaxLinks("PLUS_PLAN_MAX_ACTIVE_LINKS", 50),
      analyticsRetentionDays: parseRetention(
        "PLUS_PLAN_ANALYTICS_RETENTION_DAYS",
        90
      ),
    },
    pro: {
      maxActiveLinks: parseMaxLinks(
        "PRO_PLAN_MAX_ACTIVE_LINKS",
        Number.POSITIVE_INFINITY
      ),
      analyticsRetentionDays: parseRetention(
        "PRO_PLAN_ANALYTICS_RETENTION_DAYS",
        365
      ),
    },
  },
};
