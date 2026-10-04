import type { PendingView } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { filterPendingItems } from './filterPendingItems'

describe('filterPendingItems', () => {
  it('matches title and detail with URL filters', () => {
    const item: PendingView['items'][number] = {
      id: 'a',
      source: 'todo:a',
      kind: 'todo',
      state: 'blocked',
      title: 'Alpha',
      detail: 'hidden needle',
      section: null,
      ref: { file: '/tmp/a', line: 1 },
      ageMs: null,
    }
    expect(
      filterPendingItems([item], {
        q: 'NEEDLE',
        state: 'blocked',
        source: 'todo:a',
      }),
    ).toEqual([item])
    expect(filterPendingItems([item], { q: 'missing' })).toEqual([])
  })
})
