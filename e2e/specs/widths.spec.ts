import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'
import { waitForScreenReady } from '../support/waitForScreenReady'

// Spec 9: every screen at phone, tablet and desktop widths, both themes, without
// sideways scroll. Screenshots land in test-results/ for the visual review.
for (const width of [375, 768, 1280]) {
  for (const colorScheme of ['dark', 'light'] as const) {
    test(`every screen fits ${String(width)} px in ${colorScheme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ colorScheme })
      await signIn(page)
      for (const path of [
        '/',
        '/memory',
        '/atrium',
        '/clips',
        '/worker',
        '/pending',
        '/system',
        '/brain',
      ]) {
        await page.goto(path)
        await waitForScreenReady(page, path, width)
        if (path === '/brain') {
          await expect(page.getByText('Show pages')).toBeVisible()
        }
        await page.screenshot({
          path: `test-results/screens/${String(width)}-${colorScheme}${path === '/' ? '/home' : path}.png`,
          fullPage: true,
        })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true)
      }
    })
  }
}

for (const colorScheme of ['dark', 'light'] as const) {
  test(`phone slots and installable shell in ${colorScheme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.emulateMedia({ colorScheme })
    await signIn(page)
    const tabs = page.getByRole('navigation', { name: 'Tabs' })
    await expect(tabs).toBeVisible()
    for (const [label, path] of [
      ['Memory', '/memory'],
      ['Worker', '/worker'],
      ['Pending', '/pending'],
      ['Orbit', '/'],
    ] as const) {
      const slot = tabs.getByRole('link', { name: label })
      await slot.click()
      await expect(page).toHaveURL(
        new RegExp(`${path === '/' ? '/' : path}(\\?.*)?$`),
      )
      await expect(slot).toHaveAttribute('aria-current', 'page')
    }
    expect(
      await tabs.locator('a, button').evaluateAll((slots) =>
        slots.every((slot) => {
          const label = slot.querySelector('span')
          return (
            slot.getBoundingClientRect().height >= 44 &&
            label !== null &&
            label.scrollWidth <= label.clientWidth
          )
        }),
      ),
    ).toBe(true)
    const response = await page.request.get('/manifest.webmanifest')
    expect(response.headers()['content-type']).toContain(
      'application/manifest+json',
    )
    expect(await response.json()).toMatchObject({
      name: 'orbit',
      short_name: 'orbit',
      display: 'standalone',
      start_url: '/',
    })
  })

  test(`phone More sheet in ${colorScheme}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.emulateMedia({ colorScheme })
    await signIn(page)
    const more = page
      .getByRole('navigation', { name: 'Tabs' })
      .getByRole('button', { name: 'More' })
    await more.click()
    const sheet = page.getByRole('dialog', { name: 'More screens' })
    await expect(sheet).toBeVisible()
    await expect(sheet.getByRole('link', { name: 'Atrium' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(sheet.getByRole('link', { name: 'System' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(more).toBeFocused()
    await more.click()
    await sheet.getByRole('link', { name: 'Brain' }).click()
    await expect(page).toHaveURL(/\/brain(\?.*)?$/)
    await expect(more).toHaveAttribute('aria-current', 'page')
    await more.click()
    await expect(sheet.getByRole('link', { name: 'Brain' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await sheet.getByRole('button', { name: 'Close more screens' }).click()
    await expect(more).toBeFocused()
  })
}

test('desktop keeps the complete sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await signIn(page)
  await expect(page.getByRole('navigation', { name: 'Tabs' })).toBeHidden()
  const primary = page.getByRole('navigation', { name: 'Primary' })
  await expect(primary).toBeVisible()
  await expect(primary.getByRole('link')).toHaveCount(8)
})
