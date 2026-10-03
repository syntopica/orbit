import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

// Spec 9: every screen at phone and tablet widths, both themes, without
// sideways scroll. Screenshots land in test-results/ for the visual review.
for (const width of [375, 768]) {
  for (const colorScheme of ['dark', 'light'] as const) {
    test(`every screen fits ${String(width)} px in ${colorScheme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ colorScheme })
      await signIn(page)
      for (const path of ['/', '/worker', '/system']) {
        await page.goto(path)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await page.screenshot({
          path: `test-results/screens/${String(width)}-${colorScheme}${path === '/' ? '/home' : path}.png`,
          fullPage: true,
        })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true)
      }
    })
  }
}
