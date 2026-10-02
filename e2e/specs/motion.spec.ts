import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test.use({ reducedMotion: 'reduce' })

test('runs no animation when reduced motion is requested', async ({ page }) => {
  await signIn(page)
  await expect(
    page.getByRole('img', { name: /^Synthetic probe/ }),
  ).toBeVisible()
  await page.waitForTimeout(2_500)
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  expect(await page.locator('[data-pulse]').count()).toBe(0)
})
