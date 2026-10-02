import type { Page } from '@playwright/test'

let next = 1

// The server rate-limits sign-in per source (5 a minute); each page claims its own forwarded source so one suite is not throttled by itself.
export const useOwnSource = async (page: Page): Promise<void> => {
  next += 1
  await page
    .context()
    .setExtraHTTPHeaders({ 'X-Forwarded-For': `10.0.0.${next}` })
}
