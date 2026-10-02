import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

for (const colorScheme of ['dark', 'light'] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme })

    test('login, orbit, worker and system have no axe violations', async ({
      page,
    }) => {
      await page.goto('/login')
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await signIn(page)
      await expect(
        page.getByRole('img', { name: /^Synthetic probe/ }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.goto('/worker')
      await expect(
        page.getByRole('region', { name: 'Diagnosis' }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.goto('/system')
      await expect(
        page.getByRole('heading', { name: 'com.example.nightly' }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    })
  })
}
