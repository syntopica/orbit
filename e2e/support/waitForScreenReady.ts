import { expect, type Page } from '@playwright/test'

export const waitForScreenReady = async (
  page: Page,
  path: string,
  width: number,
): Promise<void> => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  if (path === '/memory') {
    const flow = page.getByRole(width < 768 ? 'list' : 'group', {
      name: width < 768 ? 'Stages' : 'Memory flow diagram',
    })
    await expect(
      flow.getByRole('button', { name: /^Index: Fresh/ }),
    ).toBeVisible()
  }
  if (path === '/atrium') {
    await expect(page.getByRole('region', { name: 'Freshness' })).toBeVisible()
    await expect(
      page.getByRole('slider', {
        name: 'Synthesized and deferred per bucket',
      }),
    ).toBeVisible()
  }
  if (path === '/clips') {
    await expect(page.getByRole('region', { name: 'Funnel' })).toBeVisible()
    await expect(
      page.getByRole('slider', {
        name: 'Pending and needing review per bucket',
      }),
    ).toBeVisible()
  }
}
