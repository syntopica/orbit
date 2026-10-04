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

test('atrium shows doctor codes and inspects a context query', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/atrium')
  const doctor = page.getByRole('region', { name: 'Doctor' })
  await expect(doctor).toContainText(
    'warn synthesis synthesis_orphan_conversations',
  )
  await expect(doctor).toContainText('Published 2m ago.')
  const inspector = page.getByRole('region', { name: 'Context inspector' })
  await inspector.getByLabel('Query').fill('example project --help')
  await expect(inspector).toContainText('22 / 500 characters')
  await inspector.getByRole('button', { name: 'Inspect' }).click()
  const blocks = inspector.getByRole('list', { name: 'Blocks' })
  await expect(blocks.getByRole('listitem')).toHaveCount(2)
  await expect(blocks.getByRole('listitem').first()).toContainText('Curated')
  await expect(blocks.getByRole('listitem').nth(1)).toContainText(
    '#2 · source-a · assistant · 00000000-000 · 2026-10-01',
  )
  await expect(inspector).toContainText('Warnings: lexical_budget_exhausted')
  await inspector.getByLabel('Query').fill('nothing')
  await inspector.getByRole('button', { name: 'Inspect' }).click()
  await expect(inspector).toContainText('No evidence for this query.')
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

test('clips lists each clip with its run, worker job and result page', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/clips')
  const list = page.getByRole('list', { name: 'Clips', exact: true })
  await expect(list.getByRole('listitem')).toHaveCount(3)
  const routed = list.getByRole('listitem').first()
  await expect(routed).toContainText('MODEL_ESCALATED @ synthesis')
  await expect(routed).toContainText('escalated · 1m 33s')
  await expect(
    routed.getByRole('link', { name: 'Worker job job-example-1' }),
  ).toHaveAttribute('href', '/worker/jobs/job-example-1')
  const done = list.getByRole('listitem').nth(2)
  await expect(done).toContainText('26728 in · 43 out')
  await done.getByRole('link', { name: 'notes/c' }).click()
  await expect(page).toHaveURL(/\/brain\?.*page=notes%2Fc/)
})
