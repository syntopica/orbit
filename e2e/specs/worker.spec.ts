import { expect, test } from '@playwright/test'

import { signIn } from '../support/signIn'

test('explains why worker jobs wait and lists one failure row', async ({
  page,
}) => {
  await signIn(page)
  await page.getByRole('link', { name: 'Worker' }).first().click()
  await expect(page).toHaveURL(/\/worker(\?range=24h)?$/)
  const diagnosis = page.getByRole('region', { name: 'Diagnosis' })
  await expect(diagnosis).toContainText(
    '32 waiting and nothing running right now.',
  )
  await expect(diagnosis).toContainText('runner-a available in 4d 10h')
  await expect(diagnosis).toContainText('node-a is in use, works when idle')
  await expect(diagnosis).toContainText('node-b last reported 10h ago')
  const failures = page
    .getByRole('region', { name: 'Recent failures' })
    .getByRole('list', { name: 'Failed jobs' })
    .getByRole('listitem')
  await expect(failures).toHaveCount(2)
  await expect(failures.first()).toContainText('runner_failed')
  await expect(failures.first()).toContainText('job aaaaaaaa')
  await expect(failures.first()).toContainText('×2')
})

test('charts worker activity with a tooltip, a queue detail and a range', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await signIn(page)
  await page.goto('/worker')
  const chart = page.getByRole('slider', {
    name: 'Production attempts per bucket by provider',
  })
  await expect(chart).toBeVisible()
  const activity = page.getByRole('region', { name: 'Activity' })
  await expect(activity.getByRole('listitem')).toHaveText([
    'agy',
    'openrouter',
    'ollama',
    'failed',
  ])
  const box = await chart.boundingBox()
  if (box === null) throw new Error('chart has no box')
  await page.mouse.move(box.x + box.width - 6, box.y + box.height / 2)
  const tip = page.getByRole('tooltip')
  await expect(tip).toContainText('timeout 1')
  await expect(tip).toContainText('openrouter')
  await page
    .getByRole('region', { name: 'Queues' })
    .getByRole('button', { name: /queue\.a/ })
    .click()
  await expect(
    page.getByRole('group', { name: 'queue.a details' }),
  ).toContainText('runner_failed 2 · timeout 1')
  await expect(
    page.getByRole('group', { name: 'OpenRouter attempts today (UTC)' }),
  ).toBeVisible()
  await activity.getByRole('button', { name: '7 days' }).click()
  await expect(page).toHaveURL(/\/worker\?range=7d$/)
  await expect(chart).toBeVisible()
  expect(errors).toEqual([])
})
