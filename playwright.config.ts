import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  webServer: {
    command: "python3 -m http.server 4173",
    port: 4173,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:4173",
  },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 13"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
