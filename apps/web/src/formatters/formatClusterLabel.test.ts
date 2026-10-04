import { describe, expect, it } from 'vitest'

import { centroid } from '../geometry/centroid'
import { sceneExtent } from '../graph/sceneExtent'
import { formatClusterLabel } from './formatClusterLabel'

describe('cluster helpers', () => {
  it('names groups by their lead page and size', () => {
    expect(formatClusterLabel('notes/a', 1)).toBe('notes/a · 1 page')
    expect(formatClusterLabel('notes/a', 12)).toBe('notes/a · 12 pages')
    expect(formatClusterLabel(null, 4)).toBe('Unlinked pages · 4')
  })
  it('bounds empty input', () => {
    expect(centroid([], { x: [], y: [], community: [] })).toEqual({
      x: 0,
      y: 0,
    })
    expect(sceneExtent([])).toBe(1)
  })
})
