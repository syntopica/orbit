import type { PendingView } from '@orbit/contract'

import { toBrainChecks } from '../brainView/toBrainChecks'
import type { BrainReaders } from '../types/BrainReaders'
import type { PendingSourceResult } from '../types/PendingSourceResult'

export const readBrainPending = async (
  brain: BrainReaders,
  signal: AbortSignal,
): Promise<PendingSourceResult> => {
  const checks = toBrainChecks(await brain.checks(signal), Date.now())
  const seen = new Map<string, number>()
  const items: PendingView['items'] = checks.issues.map(({ page, code }) => {
    const key = `brain:${page}:${code}`
    const occurrence = seen.get(key) ?? 0
    seen.set(key, occurrence + 1)
    return {
      id: `${key}:${String(occurrence)}`,
      source: 'brain',
      kind: 'brain',
      state: 'issue',
      title: code,
      detail: '',
      section: null,
      ref: page,
      ageMs: null,
    }
  })
  return {
    source: {
      id: 'brain',
      kind: 'brain',
      name: 'Brain lint',
      status: 'ok',
      count: items.length,
    },
    items,
  }
}
