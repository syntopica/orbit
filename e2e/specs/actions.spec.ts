import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('scheduled run needs confirmation and reaches the ticker', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/system')
  const row = page
    .getByRole('listitem')
    .filter({ hasText: 'com.example.nightly' })
  await row.getByRole('button', { name: 'Run now' }).click()
  const dialog = page.getByRole('dialog', { name: 'Confirm run' })
  await expect(dialog).toContainText('com.example.nightly')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(dialog).toHaveCount(0)
  await row.getByRole('button', { name: 'Run now' }).click()
  await dialog.getByRole('button', { name: 'Confirm run' }).click()
  await expect(row.getByRole('link', { name: 'View run' })).toBeVisible()
  await page.goto('/')
  await expect(
    page
      .getByRole('listitem')
      .filter({ hasText: 'com.example.nightly run succeeded' }),
  ).toBeVisible()
})

test('engine action needs confirmation and reports failure', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/brain')
  await page.getByRole('button', { name: 'Fail graph action' }).click()
  const dialog = page.getByRole('dialog', { name: 'Confirm fail' })
  await expect(dialog).toContainText('brain')
  await dialog.getByRole('button', { name: 'Confirm fail' }).click()
  await page.goto('/')
  await expect(
    page
      .getByRole('listitem')
      .filter({ hasText: 'brain fail failed (exit 1)' }),
  ).toBeVisible()
})
