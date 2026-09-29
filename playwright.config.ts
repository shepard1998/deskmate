import { defineConfig, devices } from "@playwright/test";

// Local runs read the Supabase settings from .env.local (existing variables
// win); CI provides them as environment variables instead.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local, as in CI.
}

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  // Creates and removes the Supabase users the auth tests sign up with.
  globalSetup: "./e2e/support/global-setup.ts",
  globalTeardown: "./e2e/support/global-teardown.ts",
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
