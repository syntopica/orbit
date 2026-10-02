import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test.describe('with motion allowed', () => {
  test('pulses on an observation and runs its animation', async ({ page }) => {
    await signIn(page)
    const pulse = page.getByTestId('pulse').first()
    await expect(pulse).toBeAttached({ timeout: 10_000 })
    await expect
      .poll(() =>
        pulse.evaluate((element) => getComputedStyle(element).animationName),
      )
      .not.toBe('none')
  })
})

test.describe('with reduced motion requested', () => {
  test.use({ reducedMotion: 'reduce' })

  test('runs no animation and renders no pulse', async ({ page }) => {
    await signIn(page)
    await expect(
      page.getByRole('status', { name: 'Connection' }).first(),
    ).toHaveText('Live')
    await expect(
      page.getByRole('img', { name: /^Synthetic probe: Healthy/ }),
    ).toBeVisible()
    expect(await page.getByTestId('pulse').count()).toBe(0)
    // The JS gate renders no pulse; this probe proves the stylesheet rule alone also stops an animation.
    const probe = await page.evaluate(() => {
      const element = document.createElement('div')
      element.style.animation = 'pulse-ring 1s infinite'
      document.body.append(element)
      return {
        name: getComputedStyle(element).animationName,
        running: document.getAnimations().length,
      }
    })
    expect(probe).toEqual({ name: 'none', running: 0 })
  })
})
