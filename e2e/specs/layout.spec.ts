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

test('a phone gets the worker queues as a list without sideways scroll', async ({
  page,
}) => {
  await signIn(page)
  await page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('link', { name: 'Worker' })
    .click()
  await expect(page.getByRole('region', { name: 'Queues' })).toContainText(
    'queue.a',
  )
  await expect(page.getByRole('table')).toHaveCount(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})
