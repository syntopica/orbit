import { expect, test } from '@playwright/test'

import { runOrbit } from '../support/runOrbit'

test('pairs a device once from the printed link', async ({ page, browser }) => {
  const output = await runOrbit(['pair'])
  const link =
    /https:\/\/orbit\.example\.ts\.net(\/pair#\S+)/.exec(output)?.[1] ?? ''
  await page.goto(link)
  await page.waitForURL('/')
  await expect(page).not.toHaveURL(/#/)
  const second = await browser.newPage()
  await second.goto(link)
  await expect(second.getByRole('alert')).toContainText(
    'expired or already used',
  )
})
