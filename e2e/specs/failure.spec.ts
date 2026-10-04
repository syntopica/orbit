import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { expect, test } from '@playwright/test'

import { E2E } from '../support/paths'
import { signIn } from '../support/signIn'

const flag = join(E2E.stateDir, 'synthetic-fail')

test.afterEach(async () => rm(flag, { force: true }))

test('one failing component goes down alone and recovers', async ({ page }) => {
  await signIn(page)
  await expect(
    page.getByRole('img', { name: /^Synthetic probe: Up/ }),
  ).toBeVisible()
  await writeFile(flag, '')
  await expect(
    page.getByRole('img', { name: /^Synthetic probe: Down/ }),
  ).toBeVisible({ timeout: 10_000 })
  await expect(
    page
      .getByRole('status', { name: 'Notifications' })
      .filter({ hasText: 'Synthetic probe is down' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: /^Scheduled jobs: Down/ }),
  ).toHaveCount(0)
  await rm(flag)
  await expect(
    page.getByRole('img', { name: /^Synthetic probe: Up/ }),
  ).toBeVisible({ timeout: 10_000 })
})
