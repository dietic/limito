import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("login → create link → redirect increments click count", async ({
  page,
  request,
}: {
  page: Page;
  request: APIRequestContext;
}) => {
  const email = process.env["E2E_EMAIL"];
  const password = process.env["E2E_PASSWORD"];
  test.skip(!email || !password, "E2E_EMAIL and E2E_PASSWORD are required");

  // 1) Login via UI
  await page.goto("/login");
  // Wait for inputs to become enabled (auth hook sets loading initially)
  await page.waitForSelector("input#email:not([disabled])", {
    timeout: 15_000,
  });
  await page.waitForSelector("input#password:not([disabled])", {
    timeout: 15_000,
  });
  await page.getByLabel(/Email address/i).fill(email!);
  await page.getByLabel(/Password/i).fill(password!);
  await page.getByRole("button", { name: /Sign in/i }).click();
  await page.waitForURL(/\/dashboard(\?|$)/, { timeout: 15_000 });

  // Get bearer token from auth cookie set by the app
  const cookies = await page.context().cookies();
  const authCookie = cookies.find((c) => c.name === "sb-localhost-auth-token");
  expect(authCookie, "Expected auth cookie to be set after login").toBeTruthy();
  const token = authCookie!.value;

  // Helper to GET links with auth
  async function getLinks() {
    const res = await request.get("/api/links?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json?.success).toBe(true);
    return json.data; // paginated shape { items, total, ... }
  }

  // 2) Create a link via UI
  const slug = `e2e-${Date.now()}`;
  // Log slug to help find it if KEEP is enabled
  // eslint-disable-next-line no-console
  console.log(`[E2E] Creating link with slug: ${slug}`);
  await page.goto("/links/new");
  await page.getByLabel(/Destination URL/i).fill("https://example.com/");
  await page.getByRole("button", { name: /By clicks/i }).click();
  await page.getByLabel(/Click limit/i).fill("5");
  await page.getByLabel(/Custom slug/i).fill(slug);
  await page.getByRole("button", { name: /Create link/i }).click();

  // Wait for auto-redirect back to /links
  await page.waitForURL(/\/links(\?|$)/, { timeout: 20_000 });

  // Find the link in API
  const afterCreate = await getLinks();
  type L = { id: string; slug: string; click_count?: number };
  const created = ((afterCreate.items as L[]) || (afterCreate as L[])).find(
    (l) => l.slug === slug
  );
  expect(created, "Created link should appear in API results").toBeTruthy();
  const createdLink = created!;

  // 3) Record clicks before, then hit the redirect route
  const beforeClicks = createdLink.click_count ?? 0;
  await page.goto(`/r/${slug}`);
  await page.waitForURL(/https:\/\/example\.com\//, { timeout: 15_000 });

  // 4) Verify click count incremented via API
  const afterClick = await getLinks();
  const updated = ((afterClick.items as L[]) || (afterClick as L[])).find(
    (l) => l.slug === slug
  ) as (L & { click_count?: number }) | undefined;
  expect(updated, "Updated link should be found").toBeTruthy();
  const updatedLink = updated!;
  expect(updatedLink.click_count ?? 0).toBe(beforeClicks + 1);

  // 5) Cleanup (delete link) to keep environment tidy unless KEEP is set
  const keep =
    process.env["E2E_KEEP"] === "1" || process.env["E2E_KEEP"] === "true";
  if (!keep) {
    const id = updatedLink.id;
    const del = await request.delete(`/api/links/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(del.ok(), "Cleanup: delete created link").toBeTruthy();
  } else {
    // eslint-disable-next-line no-console
    console.log(`[E2E] KEEP enabled, leaving link with slug: ${slug}`);
  }
});

test("smoke: homepage loads and shows CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Limi\.to/i);
  const cta = page
    .getByRole("link", {
      name: /Start creating links|Get Started|Start for free/i,
    })
    .first();
  await expect(cta).toBeVisible();
});
