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

const activeLink = {
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
const expiredLink = {
  ...activeLink,
  id: "l2",
  slug: "expired1",
  is_active: false,
};

describe("api/links edge cases", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("GET /api/links hasMore true when more items exist and counts are returned", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => ({ userId: "u1" }),
    }));
    const queue = [
      { data: [activeLink], error: null, count: 2 }, // main list (limit=1)
      { data: null, error: null, count: 2 }, // all
      { data: null, error: null, count: 1 }, // active
      { data: null, error: null, count: 1 }, // expired
    ];
    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => makeSupabaseQueue(queue),
    }));
    const { GET } = await import("@/app/api/links/route");
    const res = await GET(
      new Request(
        "http://localhost/api/links?limit=1&offset=0&filter=all"
      ) as unknown as NextRequest
    );
    expect(res.status).toBe(200);
    const json = await (res as Response).json();
    expect(json.data.hasMore).toBe(true);
    expect(json.data.counts).toEqual({ all: 2, active: 1, expired: 1 });
  });

  it("GET /api/links?filter=expired returns only expired links", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => ({ userId: "u1" }),
    }));
    const queue = [
      { data: [expiredLink], error: null, count: 1 }, // main
      { data: null, error: null, count: 2 }, // all
      { data: null, error: null, count: 1 }, // active
      { data: null, error: null, count: 1 }, // expired
    ];
    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => makeSupabaseQueue(queue),
    }));
    const { GET } = await import("@/app/api/links/route");
    const res = await GET(
      new Request(
        "http://localhost/api/links?limit=10&offset=0&filter=expired"
      ) as unknown as NextRequest
    );
    const json = await (res as Response).json();
    expect(json.success).toBe(true);
    expect(json.data.items).toHaveLength(1);
    expect(json.data.items[0].slug).toBe("expired1");
  });

  it("POST /api/links returns 409 when slug already exists", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => ({ userId: "u1" }),
    }));
    const queue = [
      { data: null, error: null, count: 0 }, // active head count
      { data: null, error: { code: "23505" } }, // insert conflict
    ];
    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => makeSupabaseQueue(queue),
    }));
    const { POST } = await import("@/app/api/links/route");
    const body = {
      destination_url: "https://example.com",
      mode: "by_clicks",
      click_limit: 5,
      slug: "taken",
    };
    const res = await POST(
      new Request("http://localhost/api/links", {
        method: "POST",
        body: JSON.stringify(body),
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(409);
    const json = await (res as Response).json();
    expect(json).toMatchObject({ error: true, message: "Slug already exists" });
  });

  it("GET /api/links/[id] returns 404 when not found", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => ({ userId: "u1" }),
    }));
    const queue = [{ data: null, error: { message: "no row" } }];
    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => makeSupabaseQueue(queue),
    }));
    const { GET } = await import("@/app/api/links/[id]/route");
    const res = await GET(
      new Request(
        "http://localhost/api/links/doesnotexist"
      ) as unknown as NextRequest,
      { params: Promise.resolve({ id: "doesnotexist" }) }
    );
    expect(res.status).toBe(404);
  });
});
