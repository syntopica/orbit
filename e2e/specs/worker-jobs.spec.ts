import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { E2E } from '../support/paths'
import { confirmWithStepUp } from '../support/confirmWithStepUp'
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
          /^4 jobs, newest first · read \d{2}:\d{2}:\d{2}$/,
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
  await expect(panel.getByRole('region', { name: 'Input' })).toContainText(
    'Example input',
  )
  await expect(panel.getByRole('region', { name: 'Output' })).toContainText(
    'Example output',
  )
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
  await panel.getByRole('button', { name: 'Reveal content' }).click()
  await panel
    .getByLabel('Admin token for reveal')
    .fill(readFileSync(join(E2E.root, 'token'), 'utf8').trim())
  await panel.getByRole('button', { name: 'Reveal content' }).click()
  await expect(panel.getByRole('region', { name: 'Output' })).toContainText(
    'Example output',
  )
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
  await confirmWithStepUp(dialog, 'Confirm cancel')
  await expect(page.getByText('cancelled', { exact: true })).toBeVisible()
})

test('job detail shows run metrics and the result without a reveal', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/worker/jobs/job-internal')
  await expect(page.getByRole('region', { name: 'Attempts' })).toContainText(
    '2 in · 3 out · 1.5s run · $0.00',
  )
  const result = page.getByRole('region', { name: 'Result' })
  await expect(result).toContainText('Outcomefailed')
  await expect(result).toContainText('Errortimeout')
  await page.goto('/worker/jobs')
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('link', { name: 'job-internal' }) })
  await expect(row).toContainText('model-demo')
  await expect(row).toContainText('$0.00')
  await expect(row).toContainText('1.5s')
})

test('the worker screen lists what is running now', async ({ page }) => {
  await signIn(page)
  await page.goto('/worker')
  const running = page.getByRole('region', { name: 'Running now' })
  await expect(running.getByRole('link', { name: 'job-running' })).toBeVisible()
  await expect(running).toContainText('queue.demo')
  await expect(running).toContainText('Kindinference')
  await expect(running).toContainText('Modelmodel-demo')
  await expect(running).toContainText('Nodenode-demo')
  await expect(running).toContainText('Tokens so far2 in · 3 out')
  await expect(running.getByRole('link', { name: 'job-internal' })).toHaveCount(
    0,
  )
})
