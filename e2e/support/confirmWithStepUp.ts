import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, type Locator } from '@playwright/test'

import { E2E } from './paths'

// Confirms an action dialog. The suite shares one session, so an earlier test
// may already have re-entered the token within the step-up window: answer the
// token prompt when it appears, and otherwise expect the dialog to close.
export const confirmWithStepUp = async (
  dialog: Locator,
  confirmLabel: string,
): Promise<void> => {
  await dialog.getByRole('button', { name: confirmLabel }).click()
  const token = dialog.getByLabel('Admin token for this action')
  await expect(token.or(dialog.getByRole('alert')))
    .toBeVisible({
      timeout: 2000,
    })
    .catch(() => undefined)
  if (await token.isVisible()) {
    await token.fill(readFileSync(join(E2E.root, 'token'), 'utf8').trim())
    await dialog.getByRole('button', { name: confirmLabel }).click()
  }
}
