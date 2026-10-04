import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'
import { waitForScreenReady } from '../support/waitForScreenReady'

// Spec 9: every screen at phone, tablet and desktop widths, both themes, without
// sideways scroll. Screenshots land in test-results/ for the visual review.
for (const width of [375, 768, 1280]) {
  for (const colorScheme of ['dark', 'light'] as const) {
    test(`every screen fits ${String(width)} px in ${colorScheme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ colorScheme })
      await signIn(page)
      for (const path of [
        '/',
        '/memory',
        '/atrium',
        '/clips',
        '/worker',
        '/pending',
        '/system',
        '/brain',
      ]) {
        await page.goto(path)
        await waitForScreenReady(page, path, width)
        if (path === '/brain') {
          await expect(page.getByText('Show pages')).toBeVisible()
        }
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
