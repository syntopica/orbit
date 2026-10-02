import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Page } from '@playwright/test'

import { E2E } from './paths'
import { useOwnSource } from './useOwnSource'

export const signIn = async (page: Page): Promise<void> => {
  await useOwnSource(page)
  await page.goto('/login')
  await page
    .getByLabel('Admin token')
    .fill(readFileSync(join(E2E.root, 'token'), 'utf8').trim())
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/')
}
