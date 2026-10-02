import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('lists registered labels with heartbeat strips and a URL range', async ({
  page,
}) => {
  await signIn(page)
  await page.getByRole('link', { name: 'System' }).first().click()
  await expect(
    page.getByRole('heading', { name: 'com.example.worker.serve' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'com.example.nightly' }),
  ).toBeVisible()
  await expect(page.getByText('every 1h')).toBeVisible()
  await expect(
    page.getByRole('img', { name: /com\.example\.nightly, last 24 hours/ }),
  ).toBeVisible()
  await page.getByRole('button', { name: '30 days' }).click()
  await expect(page).toHaveURL(/range=30d/)
  await expect(
    page.getByRole('img', { name: /com\.example\.nightly, last 30 days/ }),
  ).toBeVisible()
})
