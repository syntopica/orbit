import type { Cookie, Page } from '@playwright/test'

import { signInWithForm } from './signInWithForm'

// The server also caps sign-ins across all sources (30 a minute), which the
// suite outgrew; the form runs once and later pages reuse its session cookie.
let session: readonly Cookie[] | null = null

export const signIn = async (page: Page): Promise<void> => {
  if (session === null) {
    await signInWithForm(page)
    session = await page.context().cookies()
    return
  }
  await page.context().addCookies([...session])
  await page.goto('/')
}
