import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Helper to create a minimal NextRequest-like object
type FakeReq = { url: string; headers: Headers; json: () => Promise<unknown> };
function makeReq(url: string, body?: unknown): FakeReq {
  return {
    url,
    headers: new Headers(),
    json: async () => body,
  };
}

describe("api/links unauthorized errors", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("GET /api/links returns 401 on unauthorized", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => {
        throw new Error("Unauthorized");
      },
    }));
    const { GET } = await import("@/app/api/links/route");
    const res = await GET(
      makeReq("http://localhost/api/links") as unknown as NextRequest
    );
    expect(res.status).toBe(401);
    const json = await (res as Response).json();
    expect(json).toMatchObject({ error: true, message: "Unauthorized" });
  });

  it("GET /api/links/[id] returns 401 on unauthorized", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => {
        throw new Error("Unauthorized");
      },
    }));
    const { GET } = await import("@/app/api/links/[id]/route");
    const res = await GET(
      makeReq("http://localhost/api/links/123") as unknown as NextRequest,
      { params: Promise.resolve({ id: "123" }) }
    );
    expect(res.status).toBe(401);
    const json = await (res as Response).json();
    expect(json).toMatchObject({ error: true, message: "Unauthorized" });
  });

  it("DELETE /api/links/[id] returns 401 on unauthorized", async () => {
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => {
        throw new Error("Unauthorized");
      },
    }));
    const { DELETE } = await import("@/app/api/links/[id]/route");
    const res = await DELETE(
      makeReq("http://localhost/api/links/123") as unknown as NextRequest,
      { params: Promise.resolve({ id: "123" }) }
    );
    expect(res.status).toBe(401);
    const json = await (res as Response).json();
    expect(json).toMatchObject({ error: true, message: "Unauthorized" });
  });
});

describe("api/links validation errors", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("POST /api/links validates input and returns 400 for invalid body", async () => {
    // Auth ok
    vi.doMock("@/lib/auth", () => ({
      requireAuth: async () => ({ userId: "u1" }),
    }));
    // Do not mock supabase; validation should fail before DB ops for missing required fields
    const { POST } = await import("@/app/api/links/route");
    const res = await POST(
      makeReq("http://localhost/api/links", {
        foo: "bar",
      }) as unknown as NextRequest
    );
    expect(res.status).toBe(400);
    const json = await (res as Response).json();
    expect(json).toMatchObject({ error: true });
  });
});
