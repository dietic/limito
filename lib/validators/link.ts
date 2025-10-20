import { config } from "@/lib/config";
import { z } from "zod";

const urlSchema = z
  .string()
  .url()
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Invalid URL protocol" }
  );

const modeSchema = z.union([z.literal("by_date"), z.literal("by_clicks")]);

const slugSchema = z
  .string()
  .regex(config.slugs.pattern)
  .min(config.slugs.customMin)
  .max(config.slugs.customMax);

export const createLinkSchema = z
  .object({
    destination_url: urlSchema,
    fallback_url: z.string().optional().nullable(),
    mode: modeSchema,
    expires_at: z.string().datetime().optional().nullable(),
    click_limit: z.number().int().positive().optional().nullable(),
    slug: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.mode === "by_date") {
      if (!val.expires_at)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "expires_at required for by_date",
        });
      else if (new Date(val.expires_at).getTime() <= Date.now())
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "expires_at must be in the future",
        });
    }
    if (val.mode === "by_clicks") {
      if (!val.click_limit || val.click_limit <= 0)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "click_limit must be > 0 for by_clicks",
        });
    }
    if (val.slug) {
      const res = slugSchema.safeParse(val.slug);
      if (!res.success) {
        res.error.issues.forEach((i) => ctx.addIssue(i));
      }
    }
  });

export const updateLinkSchema = z
  .object({
    destination_url: urlSchema.optional(),
    fallback_url: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    mode: modeSchema.optional(),
    expires_at: z.string().datetime().optional().nullable(),
    click_limit: z.number().int().positive().optional().nullable(),
    // Allow empty string to signal "regenerate slug"
    slug: z.union([slugSchema, z.literal("")]).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.mode === "by_date") {
      if (val.expires_at && new Date(val.expires_at).getTime() <= Date.now())
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "expires_at must be in the future",
        });
    }
  });

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
