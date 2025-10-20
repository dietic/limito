import { defineConfig, devices } from "@playwright/test";

const base = process.env["APP_URL"] || "http://localhost:3000";
const webCommand = process.env["PW_WEB_COMMAND"] || "pnpm dev";
const noWebServer =
  process.env["PW_NO_WEBSERVER"] === "1" ||
  process.env["PW_NO_WEBSERVER"] === "true";

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
  webServer: noWebServer
    ? undefined
    : {
        command: webCommand,
        url: base,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
