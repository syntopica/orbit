import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('draws the brain graph and opens a page without its raw HTML', async ({
  page,
}) => {
  await signIn(page)
  await expect(page.getByRole('img', { name: /^Brain: Up/ })).toBeVisible()
  await page.getByRole('link', { name: 'Brain' }).first().click()
  await expect(
    page.getByRole('img', { name: 'Brain graph: 3 pages, 2 links, 1 orphan' }),
  ).toBeVisible()
  await page.getByText('Show pages').click()
  await page.getByRole('button', { name: 'notes/a' }).click()
  await expect(page).toHaveURL(/page=notes%2Fa/)
  const panel = page.getByRole('region', { name: 'Page', exact: true })
  await expect(
    panel.getByRole('heading', { name: 'Fixture page A' }),
  ).toBeVisible()
  await expect(panel).toContainText('(missing)')
  await expect(panel).not.toContainText('never forwarded')
  expect(await page.locator('article script').count()).toBe(0)
  await expect(
    page.getByRole('region', { name: 'Lint', exact: true }),
  ).toContainText('dangling_link')
})

test('loads related pages on demand and answers a missing page', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/brain')
  await page.getByRole('button', { name: 'Show related pages' }).click()
  await expect(
    page.getByRole('region', { name: 'Related, not linked' }),
  ).toContainText('notes/c')
  await page.goto('/brain?page=notes%2Fz')
  await expect(page.getByText('This page no longer exists.')).toBeVisible()
})

for (const colorScheme of ['dark', 'light'] as const) {
  test(`steps from the local view to the overview and draws it in 3D (${colorScheme})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme })
    await signIn(page)
    await page.goto('/brain')
    const legend = page.getByRole('region', { name: 'Legend' })
    await expect(legend).toContainText('1 step around')
    await page.keyboard.press('0')
    await expect(legend).toContainText('Overview:')
    await expect(page).toHaveURL(/depth=0/)
    await page.getByRole('button', { name: '3D' }).click()
    const graph = page.getByRole('img', { name: /^Brain graph/ })
    await expect(graph.locator('canvas')).toBeVisible()
    await page.screenshot({
      path: `test-results/screens/brain-3d-${colorScheme}.png`,
    })
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  })
}
