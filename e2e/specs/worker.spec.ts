import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('explains why worker jobs wait and lists one failure row', async ({
  page,
}) => {
  await signIn(page)
  await page.getByRole('link', { name: 'Worker' }).first().click()
  await expect(page).toHaveURL(/\/worker$/)
  const diagnosis = page.getByRole('region', { name: 'Diagnosis' })
  await expect(diagnosis).toContainText('32 waiting and nothing running.')
  await expect(diagnosis).toContainText('runner-a available in 4d 10h')
  await expect(diagnosis).toContainText('node-a is in use, works when idle')
  await expect(diagnosis).toContainText('node-b last reported 10h ago')
  const failures = page
    .getByRole('region', { name: 'Recent failures' })
    .getByRole('listitem')
  await expect(failures).toHaveCount(2)
  await expect(failures.first()).toContainText('runner_failed')
  await expect(failures.first()).toContainText('job aaaaaaaa')
  await expect(failures.first()).toContainText('×2')
})
