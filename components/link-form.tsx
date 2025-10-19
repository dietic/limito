"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface LinkFormValues {
  destination_url: string;
  fallback_url?: string;
  mode: "by_date" | "by_clicks";
  expires_at?: string;
  click_limit?: number;
  slug?: string;
}

interface LinkFormProps {
  onSubmit?: (values: LinkFormValues) => void;
  loading?: boolean;
  initialValues?: Partial<LinkFormValues>;
  submitLabel?: string;
}

export default function LinkForm({ onSubmit, loading, initialValues, submitLabel }: LinkFormProps) {
  const [mode, setMode] = useState<"by_date" | "by_clicks">(
    initialValues?.mode ?? "by_date"
  );
  const [values, setValues] = useState<LinkFormValues>({
    destination_url: initialValues?.destination_url ?? "",
    fallback_url: initialValues?.fallback_url,
    mode: initialValues?.mode ?? "by_date",
    expires_at: initialValues?.expires_at,
    click_limit: initialValues?.click_limit,
    slug: initialValues?.slug,
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(values);
      }}
    >
      <div>
        <label
          htmlFor="destination_url"
          className="block text-sm font-medium text-foreground"
        >
          Destination URL
        </label>
        <Input
          id="destination_url"
          type="url"
          placeholder="https://example.com"
          value={values.destination_url}
          onChange={(e) =>
            setValues((v) => ({ ...v, destination_url: e.target.value }))
          }
          required
          disabled={loading}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Where should this link redirect to?
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          Expiration Mode
        </label>
        <div className="mt-2 flex gap-3">
          <Button
            type="button"
            variant={mode === "by_date" ? "default" : "ghost"}
            onClick={() => {
              setMode("by_date");
              setValues((v) => ({
                ...v,
                mode: "by_date",
                click_limit: undefined,
              }));
            }}
            disabled={loading}
            className="flex-1"
          >
            By date
          </Button>
          <Button
            type="button"
            variant={mode === "by_clicks" ? "default" : "ghost"}
            onClick={() => {
              setMode("by_clicks");
              setValues((v) => ({
                ...v,
                mode: "by_clicks",
                expires_at: undefined,
              }));
            }}
            disabled={loading}
            className="flex-1"
          >
            By clicks
          </Button>
        </div>
      </div>

      {mode === "by_date" ? (
        <div>
          <label
            htmlFor="expires_at"
            className="block text-sm font-medium text-foreground"
          >
            Expires at
          </label>
          <Input
            id="expires_at"
            type="datetime-local"
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                expires_at: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              }))
            }
            required
            disabled={loading}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Link will expire at this date and time
          </p>
        </div>
      ) : (
        <div>
          <label
            htmlFor="click_limit"
            className="block text-sm font-medium text-foreground"
          >
            Click limit
          </label>
          <Input
            id="click_limit"
            type="number"
            min={1}
            step={1}
            placeholder="100"
            onChange={(e) =>
              setValues((v) => ({ ...v, click_limit: Number(e.target.value) }))
            }
            required
            disabled={loading}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Link will expire after this many clicks
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-foreground"
        >
          Custom slug (optional)
        </label>
        <Input
          id="slug"
          type="text"
          placeholder="my-offer"
          onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
          disabled={loading}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Leave empty to generate a random slug
        </p>
      </div>

      <div>
        <label
          htmlFor="fallback_url"
          className="block text-sm font-medium text-foreground"
        >
          Fallback URL (optional)
        </label>
        <Input
          id="fallback_url"
          type="url"
          placeholder="https://example.com/expired"
          onChange={(e) =>
            setValues((v) => ({ ...v, fallback_url: e.target.value }))
          }
          disabled={loading}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Where to redirect when the link expires
        </p>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full">
          {loading
            ? submitLabel
              ? `${submitLabel}...`
              : values.slug || initialValues?.destination_url
              ? "Saving..."
              : "Creating link..."
            : submitLabel ?? (values.slug || initialValues?.destination_url ? "Save changes" : "Create link")}
        </Button>
      </div>
    </form>
  );
}
