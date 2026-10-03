import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

for (const colorScheme of ['dark', 'light'] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme })

    test('login, orbit, worker, system and brain have no axe violations', async ({
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
      await expect(
        page.getByRole('slider', {
          name: 'Production attempts per bucket by provider',
        }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.goto('/system')
      await expect(
        page.getByRole('heading', { name: 'com.example.nightly' }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.goto('/brain?page=notes%2Fa')
      await expect(
        page.getByRole('heading', { name: 'Fixture page A' }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    })
    test('memory flow, atrium and clips have no axe violations', async ({
      page,
    }) => {
      await signIn(page)
      await page.goto('/memory')
      await expect(
        page.getByRole('group', { name: 'Memory flow diagram' }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.goto('/atrium')
      await expect(
        page.getByRole('region', { name: 'Freshness' }),
      ).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.goto('/clips')
      await expect(page.getByRole('region', { name: 'Funnel' })).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    })
  })
}
