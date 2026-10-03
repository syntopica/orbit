import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('draws the memory flow and opens a stage panel', async ({ page }) => {
  await signIn(page)
  await page.getByRole('link', { name: 'Memory', exact: true }).first().click()
  await expect(page).toHaveURL(/\/memory$/)
  await expect(
    page.getByRole('group', { name: 'Memory flow diagram' }),
  ).toBeVisible()
  await page.getByRole('button', { name: /^Index: Fresh/ }).click()
  await expect(page).toHaveURL(/\/memory\?stage=index$/)
  await expect(
    page.getByRole('complementary', { name: 'Index' }),
  ).toContainText('2 records not indexed')
  await page.getByRole('button', { name: /^Curation:/ }).click()
  await expect(
    page.getByRole('complementary', { name: 'Curation' }),
  ).toContainText('com.example.nightly')
  await expect(
    page.getByRole('button', { name: 'Session-stop hook: Not measured' }),
  ).toBeVisible()
})

test('atrium shows sources, freshness, synthesis and index gaps', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/atrium')
  await expect(
    page.getByRole('region', { name: 'Records per source' }),
  ).toContainText('source-a')
  await expect(page.getByRole('region', { name: 'Freshness' })).toContainText(
    'Fresh',
  )
  await expect(
    page.getByRole('region', { name: 'Not in the index' }),
  ).toContainText('model-a')
  await expect(page.getByRole('region', { name: 'Synthesis' })).toContainText(
    '3 synthesized',
  )
  await expect(
    page.getByRole('slider', { name: 'Synthesized and deferred per bucket' }),
  ).toBeVisible()
})

test('clips shows the funnel, intake, oldest waiting and doctor, no content', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/clips')
  const funnel = page.getByRole('region', { name: 'Funnel' })
  await expect(funnel.getByRole('listitem')).toHaveCount(5)
  await expect(funnel).toContainText('in reconciliation')
  await expect(
    page.getByRole('slider', { name: 'Clips captured per day' }),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Oldest waiting' }),
  ).toContainText('pending')
  await expect(page.getByRole('region', { name: 'Doctor' })).toContainText(
    'All checks pass.',
  )
  await expect(page.getByText('notes/a')).toHaveCount(0)
})
