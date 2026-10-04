import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { E2E } from '../support/paths'
import { signIn } from '../support/signIn'

for (const colorScheme of ['dark', 'light'] as const) {
  for (const width of [1280, 375]) {
    test.describe(`${colorScheme} ${String(width)}px jobs`, () => {
      test.use({ colorScheme, viewport: { width, height: 900 } })
      test('list and detail are accessible without horizontal overflow', async ({
        page,
      }) => {
        await signIn(page)
        await page.goto('/worker/jobs')
        const list = page.getByRole('region', { name: 'Job list' })
        await expect(
          list.getByRole('link', { name: 'job-internal' }),
        ).toBeVisible()
        await page.getByRole('button', { name: 'Apply filters' }).click()
        await expect(list.getByRole('status')).toHaveText(
          /^3 jobs, newest first · read \d{2}:\d{2}:\d{2}$/,
        )
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width)
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        )
        await page.getByRole('link', { name: 'job-internal' }).click()
        await expect(
          page.getByRole('region', { name: 'Attempts' }),
        ).toContainText('node-demo')
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width)
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        )
      })
    })
  }
}

test('internal content reveals as plain text', async ({ page }) => {
  await signIn(page)
  await page.goto('/worker/jobs/job-internal')
  const panel = page.getByRole('region', { name: 'Content' })
  await panel.getByRole('button', { name: 'Open content' }).click()
  await expect(panel.locator('pre')).toContainText('Example input')
  await panel.getByRole('button', { name: 'Hide content' }).click()
  await expect(panel.locator('pre')).toHaveCount(0)
})

test('secret content needs step-up and auto-hides after 60 seconds', async ({
  page,
}) => {
  await page.clock.install()
  await signIn(page)
  await page.goto('/worker/jobs/job-secret')
  const panel = page.getByRole('region', { name: 'Content' })
  await panel.getByRole('button', { name: 'Reveal' }).click()
  await panel
    .getByLabel('Admin token for reveal')
    .fill(readFileSync(join(E2E.root, 'token'), 'utf8').trim())
  await panel.getByRole('button', { name: 'Reveal' }).click()
  await expect(panel.locator('pre')).toContainText('Example output')
  await page.clock.fastForward(60_000)
  await expect(panel.locator('pre')).toHaveCount(0)
})

test('cancel waits for confirmation and refreshes job', async ({ page }) => {
  await signIn(page)
  await page.goto('/worker/jobs/job-cancel')
  await expect(page.getByRole('heading', { name: 'job-cancel' })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel job' }).click()
  const dialog = page.getByRole('dialog', { name: 'Confirm cancel' })
  await expect(dialog).toContainText('job-cancel')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: 'Cancel job' }).click()
  await dialog.getByRole('button', { name: 'Confirm cancel' }).click()
  await expect(page.getByText('cancelled', { exact: true })).toBeVisible()
})
