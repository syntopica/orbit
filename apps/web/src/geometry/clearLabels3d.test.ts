import { describe, expect, it } from 'vitest'

import { clearLabels3d } from './clearLabels3d'

const box = (left: number, top: number) => ({
  left,
  top,
  width: 100,
  height: 20,
})

describe('clearLabels3d', () => {
  it('keeps the first of two overlapping labels and any clear one', () => {
    expect(
      clearLabels3d([box(0, 0), box(50, 10), box(0, 30), null, box(200, 0)]),
    ).toEqual([true, false, true, false, true])
  })
  it('lets labels that only touch both show', () => {
    expect(clearLabels3d([box(0, 0), box(100, 0)])).toEqual([true, true])
  })
})
