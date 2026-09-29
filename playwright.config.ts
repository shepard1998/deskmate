import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // In CI, annotate failures on GitHub and keep an HTML report to upload as an artifact.
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chrome",
      // Uses the locally installed Google Chrome instead of downloading Chromium.
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    // Test the production build, the same artifact that gets deployed.
    // CI builds in an earlier step, so it only needs to start the server.
    command: isCI ? "pnpm start" : "pnpm build && pnpm start",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
