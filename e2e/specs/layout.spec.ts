import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test.use({ viewport: { width: 390, height: 844 } })

test('a phone gets the list and the tab bar', async ({ page }) => {
  await signIn(page)
  await expect(
    page.getByRole('listitem', { name: /^Synthetic probe:/ }),
  ).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Tabs' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})
