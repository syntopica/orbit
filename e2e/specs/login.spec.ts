import { expect, test } from '@playwright/test'

import { signInWithForm } from '../support/signInWithForm'

test('signs in and shows live satellites', async ({ page }) => {
  await signInWithForm(page)
  await expect(
    page.getByRole('status', { name: 'Connection' }).first(),
  ).toHaveText('Live')
  await expect(
    page.getByRole('img', { name: /^Synthetic probe: Up/ }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: /^Scheduled jobs:/ }),
  ).toBeVisible()
})

test('rejects a wrong token', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Admin token').fill('wrong')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toHaveText('Token rejected')
})

test('sends a signed-out visitor to login', async ({ page }) => {
  await page.goto('/')
  await page.waitForURL('/login')
})
