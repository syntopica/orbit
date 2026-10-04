import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

for (const colorScheme of ['dark', 'light'] as const) {
  for (const width of [1280, 375]) {
    test.describe(`pending ${colorScheme} ${String(width)}px`, () => {
      test.use({ colorScheme, viewport: { width, height: 900 } })
      test('shows the board, filters in the URL and expands plain text', async ({
        page,
      }) => {
        await signIn(page)
        await page.goto('/pending')
        await expect(
          page.getByRole('heading', { name: 'Pending', exact: true }),
        ).toBeVisible()
        await expect(page.getByText('Resolve placeholder item')).toBeVisible()
        await page.getByRole('button', { name: 'Collapse all' }).click()
        await expect(page.getByText('Resolve placeholder item')).toBeHidden()
        await page.getByRole('button', { name: 'Expand all' }).click()
        await page.getByRole('button', { name: /blocked 1/ }).click()
        await expect(page).toHaveURL(/state=blocked/)
        await page.getByText(/^Sources \(/).click()
        await page.getByRole('button', { name: 'example 3' }).click()
        await expect(page).toHaveURL(/source=todo%3Aexample/)
        await page.getByText('Resolve placeholder item').click()
        await expect(page.getByText('Placeholder detail')).toBeVisible()
        await page
          .getByRole('searchbox', { name: 'Search title and detail' })
          .fill('placeholder detail')
        await expect(page).toHaveURL(/q=placeholder/)
        await expect(page.getByText('Resolve placeholder item')).toBeVisible()
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
