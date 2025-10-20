import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: process.env["APP_URL"] || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm run -s build && pnpm start",
    url: process.env["APP_URL"] || "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
