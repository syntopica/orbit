import { describe, expect, it } from 'vitest'

import { relatedFor } from './relatedFor'

const pairs = [
  { left: 'notes/b', right: 'notes/c', score: 3 },
  { left: 'notes/c', right: 'notes/a', score: 2 },
  { left: 'notes/a', right: 'notes/d', score: 1 },
]

describe('relatedFor', () => {
  it('puts the pairs of the selected page first', () => {
    expect(relatedFor(pairs, 'notes/a').map((pair) => pair.score)).toEqual([
      2, 1, 3,
    ])
    expect(relatedFor(pairs, null)).toEqual(pairs)
  })
})
