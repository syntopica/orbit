import { defineConfig, devices } from '@playwright/test'

import { E2E } from './support/paths'

export default defineConfig({
  testDir: './specs',
  globalSetup: './globalSetup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: E2E.baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
