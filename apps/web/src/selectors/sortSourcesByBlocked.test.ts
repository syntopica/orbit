import type { PendingView } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { sortSourcesByBlocked } from './sortSourcesByBlocked'

const source = (id: string) => ({ id }) as PendingView['sources'][number]
const item = (src: string, state: string) =>
  ({ source: src, state }) as PendingView['items'][number]

describe('sortSourcesByBlocked', () => {
  it('puts the most blocked source first and keeps ties in order', () => {
    const sorted = sortSourcesByBlocked(
      [source('a'), source('b'), source('c'), source('d')],
      [
        item('c', 'blocked'),
        item('c', 'blocked'),
        item('b', 'blocked'),
        item('a', 'open'),
      ],
    )
    expect(sorted.map((s) => s.id)).toEqual(['c', 'b', 'a', 'd'])
  })
})
