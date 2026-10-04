import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

for (const colorScheme of ['dark', 'light'] as const) {
  for (const width of [1280, 1024]) {
    test(`desktop 3D orbit is accessible in ${colorScheme} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ colorScheme })
      await signIn(page)
      const orbit = page.getByRole('group', { name: 'Components' })
      await expect(orbit.locator('canvas')).toBeVisible()
      await expect(orbit.getByRole('img', { name: /^Brain: Up/ })).toBeVisible()
      await expect(orbit.getByRole('img', { name: /^Worker:/ })).toBeVisible()
      const collisions = await orbit.evaluate((stage) => {
        const labels = [...stage.querySelectorAll<HTMLElement>('.orbit-label')]
        const leaders = [
          ...stage.querySelectorAll<SVGPathElement>('.orbit-leaders path'),
        ]
        const boxes = labels.map((label) => label.getBoundingClientRect())
        const overlap = boxes.some((box, index) =>
          boxes
            .slice(index + 1)
            .some(
              (other) =>
                box.left < other.right + 4 &&
                box.right + 4 > other.left &&
                box.top < other.bottom + 4 &&
                box.bottom + 4 > other.top,
            ),
        )
        const stageBox = stage.getBoundingClientRect()
        const sphereOverlap = boxes.some((box) =>
          labels.some((label) => {
            const x = stageBox.left + Number(label.dataset['sphereX'])
            const y = stageBox.top + Number(label.dataset['sphereY'])
            const radius = Number(label.dataset['sphereRadius'])
            const nearestX = Math.max(box.left, Math.min(x, box.right))
            const nearestY = Math.max(box.top, Math.min(y, box.bottom))
            return Math.hypot(x - nearestX, y - nearestY) < radius + 4
          }),
        )
        return {
          overlap,
          sphereOverlap,
          count: labels.length,
          connected: leaders.filter(
            (leader) =>
              leader.getAttribute('d')?.startsWith('M ') === true &&
              leader.getAttribute('marker-end') === 'url(#orbit-leader-dot)',
          ).length,
        }
      })
      expect(collisions.overlap).toBe(false)
      expect(collisions.sphereOverlap).toBe(false)
      expect(collisions.count).toBeGreaterThanOrEqual(6)
      expect(collisions.connected).toBe(collisions.count)
      await page.screenshot({
        path: `test-results/screens/${width}-${colorScheme}-orbit3d.png`,
        fullPage: true,
      })
      await orbit
        .getByRole('img', { name: /^Worker:/ })
        .locator('..')
        .focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/\/worker(?:\?|$)/)
    })
  }
}

test('SVG fallback keeps satellite navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await signIn(page)
  const orbit = page.getByRole('group', { name: 'Components' })
  await expect(orbit).toHaveAttribute('viewBox', '-300 -300 600 600')
  await orbit
    .getByRole('img', { name: /^Worker:/ })
    .locator('..')
    .focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/worker(?:\?|$)/)
})
