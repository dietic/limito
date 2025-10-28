import { afterEach, describe, expect, it, vi } from "vitest";

type MockLink = { id: string; current_activation_id: string | null };

type MockConfig = {
  activeLinks?: MockLink[];
  countError?: { message?: string } | null;
  fetchError?: { message?: string } | null;
  linksUpdateError?: { message?: string } | null;
  activationUpdateError?: { message?: string } | null;
  profileUpdateError?: { message?: string } | null;
};

type Operations = {
  linksUpdates: Array<{ payload: Record<string, unknown>; ids: string[] }>;
  activationUpdates: Array<{ payload: Record<string, unknown>; ids: string[] }>;
  profileUpdates: Array<Record<string, unknown>>;
};

type MockClientResult = {
  client: {
    from: (table: string) => unknown;
  };
  state: {
    activeLinks: MockLink[];
  };
  ops: Operations;
};

function createMockClient(config: MockConfig): MockClientResult {
  const ops: Operations = {
    linksUpdates: [],
    activationUpdates: [],
    profileUpdates: [],
  };

  const state = {
    activeLinks: [...(config.activeLinks ?? [])],
  };

  function makeThenable<T>(resolveWith: T) {
    return {
      then(resolve: (value: T) => void) {
        resolve(resolveWith);
      },
    };
  }

  const client = {
    from(table: string) {
      if (table === "links") {
        return {
          select(
            _columns: string,
            options?: { count?: string; head?: boolean }
          ) {
            if (options?.head) {
              const builder = {
                eq() {
                  return builder;
                },
                order() {
                  return builder;
                },
                limit() {
                  return builder;
                },
                then(
                  resolve: (value: {
                    count: number;
                    error: unknown;
                    data: null;
                  }) => void
                ) {
                  resolve({
                    data: null,
                    error: config.countError ?? null,
                    count: state.activeLinks.length,
                  });
                },
              };
              return builder;
            }

            const builder = {
              _limit: null as number | null,
              eq() {
                return builder;
              },
              order() {
                return builder;
              },
              limit(n: number) {
                builder._limit = n;
                return builder;
              },
              then(
                resolve: (value: { data: MockLink[]; error: unknown }) => void
              ) {
                const limit = builder._limit ?? state.activeLinks.length;
                const data = state.activeLinks
                  .slice(0, limit)
                  .map(({ id, current_activation_id }) => ({
                    id,
                    current_activation_id,
                  }));
                resolve({
                  data,
                  error: config.fetchError ?? null,
                });
              },
            };
            return builder;
          },
          update(payload: Record<string, unknown>) {
            return {
              in(_column: string, ids: string[]) {
                ops.linksUpdates.push({ payload, ids });
                if (!config.linksUpdateError) {
                  state.activeLinks = state.activeLinks.filter(
                    (link) => !ids.includes(link.id)
                  );
                }
                return makeThenable({
                  error: config.linksUpdateError ?? null,
                });
              },
            };
          },
        };
      }
      if (table === "link_activations") {
        return {
          update(payload: Record<string, unknown>) {
            return {
              in(_column: string, ids: string[]) {
                ops.activationUpdates.push({ payload, ids });
                return makeThenable({
                  error: config.activationUpdateError ?? null,
                });
              },
            };
          },
        };
      }
      if (table === "profiles") {
        return {
          update(payload: Record<string, unknown>) {
            return {
              eq() {
                ops.profileUpdates.push(payload);
                return makeThenable({
                  error: config.profileUpdateError ?? null,
                });
              },
            };
          },
        };
      }
      throw new Error(`Unexpected table ${table}`);
    },
  };

  return { client, ops, state };
}

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("enforceActiveLinkLimit", () => {
  it("deactivates links beyond the configured limit", async () => {
    const { client, ops, state } = createMockClient({
      activeLinks: [
        { id: "link-1", current_activation_id: "act-1" },
        { id: "link-2", current_activation_id: null },
        { id: "link-3", current_activation_id: "act-3" },
        { id: "link-4", current_activation_id: null },
      ],
    });

    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => client,
    }));

    const { enforceActiveLinkLimit } = await import("@/lib/plans");

    const result = await enforceActiveLinkLimit("user-1", "free");

    expect(result.trimmed).toBe(2);
    expect(ops.linksUpdates).toHaveLength(1);
    const linksUpdate = ops.linksUpdates[0]!;
    expect(linksUpdate.ids).toEqual(["link-1", "link-2"]);
    expect(linksUpdate.payload).toMatchObject({
      is_active: false,
      current_activation_id: null,
    });
    expect(typeof linksUpdate.payload["updated_at"]).toBe("string");

    expect(ops.activationUpdates).toHaveLength(1);
    const activationUpdate = ops.activationUpdates[0]!;
    expect(activationUpdate.ids).toEqual(["act-1"]);
    expect(activationUpdate.payload).toMatchObject({
      ended_reason: "plan_downgrade",
    });

    expect(state.activeLinks.map((link) => link.id)).toEqual([
      "link-3",
      "link-4",
    ]);
  });

  it("trims in multiple batches when necessary", async () => {
    const activeLinks = Array.from({ length: 205 }, (_, index) => ({
      id: `link-${index + 1}`,
      current_activation_id: null,
    }));

    const { client, ops } = createMockClient({ activeLinks });

    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => client,
    }));

    const { enforceActiveLinkLimit } = await import("@/lib/plans");

    const result = await enforceActiveLinkLimit("user-2", "free");

    expect(result.trimmed).toBe(203);
    expect(ops.linksUpdates.length).toBe(3);
    expect(ops.linksUpdates[0]!.ids).toHaveLength(100);
    expect(ops.linksUpdates[1]!.ids).toHaveLength(100);
    expect(ops.linksUpdates[2]!.ids).toHaveLength(3);
  });
});

describe("updatePlanAndEnforce", () => {
  it("updates the plan and enforces limits", async () => {
    const { client, ops } = createMockClient({
      activeLinks: [
        { id: "link-1", current_activation_id: "act-1" },
        { id: "link-2", current_activation_id: null },
        { id: "link-3", current_activation_id: null },
      ],
    });

    vi.doMock("@/lib/supabase", () => ({
      getServiceClient: () => client,
    }));

    const { updatePlanAndEnforce } = await import("@/lib/plans");

    const result = await updatePlanAndEnforce("user-42", "free");

    expect(result.trimmed).toBe(1);
    expect(ops.profileUpdates).toEqual([{ plan: "free" }]);
    expect(ops.linksUpdates).toHaveLength(1);
    expect(ops.linksUpdates[0]!.ids).toEqual(["link-1"]);
  });
});
