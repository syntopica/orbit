import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

for (const colorScheme of ['dark', 'light'] as const) {
  for (const width of [1280, 375]) {
    test.describe(`${colorScheme} ${String(width)}px`, () => {
      test.use({ colorScheme, viewport: { width, height: 900 } })

      test('costs and executors render without overflow or axe violations', async ({
        page,
      }) => {
        await signIn(page)
        await page.goto('/worker')
        const costs = page.getByRole('region', { name: 'Costs' })
        const executors = page.getByRole('region', { name: 'Executors' })
        await expect(
          costs.getByRole('slider', { name: 'Cost per day by provider' }),
        ).toBeVisible()
        await expect(costs).toContainText('$0.25')
        await expect(executors).toContainText('runner-a / model-a')
        await expect(executors).toContainText('n < 20')
        await expect(executors).toContainText('available in')
        await costs.getByText('Show table').click()
        await expect(
          costs.getByRole('table', { name: 'Totals by provider and queue' }),
        ).toContainText('$0.00')
        await costs.getByRole('button', { name: '30 days' }).click()
        await expect(page).toHaveURL(/costs=30d/)
        await expect(
          costs.getByRole('slider', { name: 'Cost per day by provider' }),
        ).toBeVisible()
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
