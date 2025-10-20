import { defineConfig, devices } from "@playwright/test";

const base = process.env["APP_URL"] || "http://localhost:3000";
const webCommand = process.env["PW_WEB_COMMAND"] || "pnpm dev";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: base,
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
    command: webCommand,
    url: base,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
