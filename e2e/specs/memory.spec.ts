import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('shows the memory components as satellites with their pending work', async ({
  page,
}) => {
  await signIn(page)
  for (const name of ['Atrium', 'Brain', 'Clips'])
    await expect(
      page.getByRole('img', { name: new RegExp(`^${name}: Healthy`) }),
    ).toBeVisible()
  const pending = page.getByRole('region', { name: 'Pending' })
  await expect(pending).toContainText('records not indexed')
  await expect(pending).toContainText('clips pending')
  await expect(page.getByText('notes/a')).toHaveCount(0)
})
