import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

// Skipped until we run the dev server in CI; this documents the desired flow
test.skip("login → create link → redirect increments click count", async ({
  page,
  request: _request,
}: {
  page: Page;
  request: APIRequestContext;
}) => {
  await page.goto("/");
  // Placeholder: will implement auth and form flow in CI with a running server
  expect(true).toBe(true);
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
