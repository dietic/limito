import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryResult = { data: unknown; error: unknown; count?: number | null };
type Builder = {
  select: (..._args: unknown[]) => Builder;
  eq: (..._args: unknown[]) => Builder;
  order: (..._args: unknown[]) => Builder;
  range: (..._args: unknown[]) => Builder;
  single: () => Builder;
  insert: (..._args: unknown[]) => Builder;
  update: (..._args: unknown[]) => Builder;
  delete: () => Builder;
  then: (resolve: (v: QueryResult) => void) => void;
};

function makeSupabaseQueue(responses: unknown[]) {
  function builder(): Builder {
    return {
      select: () => builder(),
      eq: () => builder(),
      order: () => builder(),
      range: () => builder(),
      single: () => builder(),
      insert: () => builder(),
      update: () => builder(),
      delete: () => builder(),
      then: (resolve) => {
        const next = (responses.shift() as QueryResult | undefined) ?? {
          data: [],
          error: null,
          count: null,
        };
        resolve(next);
      },
    };
  }
  return {
    from: (_table: string) => builder(),
  };
}

const sampleLink = {
  id: "l1",
  owner_id: "u1",
  slug: "abc1234",
  destination_url: "https://example.com",
  fallback_url: null,
  mode: "by_clicks" as const,
  click_limit: 10,
  click_count: 0,
  last_clicked_at: null,
  expires_at: null,
  is_active: true,
  created_at: "2024-01-01T00:00:00.000Z",
};

describe("api/links/[id] happy paths", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("GET /api/links/[id] returns a link", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => ({ userId: "u1" }),
    }));
    const queue = [{ data: sampleLink, error: null }];
    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => makeSupabaseQueue(queue),
    }));
    const { GET } = await import("@/app/api/links/[id]/route");
    const res = await GET(
      new Request("http://localhost/api/links/l1") as unknown as NextRequest,
      { params: Promise.resolve({ id: "l1" }) }
    );
    expect(res.status).toBe(200);
    const json = await (res as Response).json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("l1");
  });

  it("PATCH /api/links/[id] updates destination_url", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => ({ userId: "u1" }),
    }));
    // 1) fetch existing, 2) update returning row
    const updated = { ...sampleLink, destination_url: "https://limi.to" };
    const queue = [
      { data: sampleLink, error: null },
      { data: updated, error: null },
    ];
    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => makeSupabaseQueue(queue),
    }));
    const { PATCH } = await import("@/app/api/links/[id]/route");
    const body = { destination_url: "https://limi.to" };
    const res = await PATCH(
      new Request("http://localhost/api/links/l1", {
        method: "PATCH",
        body: JSON.stringify(body),
      }) as unknown as NextRequest,
      { params: Promise.resolve({ id: "l1" }) }
    );
    expect(res.status).toBe(200);
    const json = await (res as Response).json();
    expect(json.success).toBe(true);
    expect(json.data.destination_url).toBe("https://limi.to");
  });

  it("DELETE /api/links/[id] deletes a link", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => ({ userId: "u1" }),
    }));
    const queue = [{ data: null, error: null }];
    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => makeSupabaseQueue(queue),
    }));
    const { DELETE } = await import("@/app/api/links/[id]/route");
    const res = await DELETE(
      new Request("http://localhost/api/links/l1", {
        method: "DELETE",
      }) as unknown as NextRequest,
      { params: Promise.resolve({ id: "l1" }) }
    );
    expect(res.status).toBe(200);
    const json = await (res as Response).json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("l1");
  });
});
