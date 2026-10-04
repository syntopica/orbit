import type { BrainGraph } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { UNTYPED } from '../charts/untypedType'
import { buildGraphModel } from './buildGraphModel'
import { filterPages } from './filterPages'
import { hopDistances } from './hopDistances'

// a - b - c - d, and e alone; b links back to a.
const graph: BrainGraph = {
  now: 0,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1, orphan: false },
    { id: 'notes/b', type: 'topic', degree: 2, orphan: false },
    { id: 'notes/c', type: 'project', degree: 2, orphan: false },
    { id: 'notes/d', type: null, degree: 1, orphan: false },
    { id: 'notes/e', type: 'project', degree: 0, orphan: true },
  ],
  edges: [
    [0, 1],
    [1, 0],
    [1, 2],
    [2, 3],
    [3, 3],
  ],
  dangling: 0,
  skipped: 0,
}

describe('buildGraphModel', () => {
  it('builds index-aligned arrays with undirected neighbours', () => {
    const model = buildGraphModel(graph)
    expect(model.types).toEqual([
      'topic',
      'topic',
      'project',
      UNTYPED,
      'project',
    ])
    expect(model.neighbours).toEqual([[1], [0, 2], [1, 3], [2], []])
    expect(model.typeNames).toEqual([UNTYPED, 'project', 'topic'])
    expect(model.indexOf.get('notes/c')).toBe(2)
  })
})

describe('hopDistances', () => {
  const model = buildGraphModel(graph)
  const all = model.ids.map(() => true)
  it('walks up to depth steps in either direction and records the step', () => {
    expect([...hopDistances(model.neighbours, all, 0, 1)]).toEqual([
      [0, 0],
      [1, 1],
    ])
    expect([...hopDistances(model.neighbours, all, 0, 3)]).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
    ])
    expect([...hopDistances(model.neighbours, all, 4, 3)]).toEqual([[4, 0]])
  })
  it('does not walk through filtered pages', () => {
    const allowed = [true, true, false, true, true]
    expect([...hopDistances(model.neighbours, allowed, 0, 3).keys()]).toEqual([
      0, 1,
    ])
  })
})

describe('filterPages', () => {
  const model = buildGraphModel(graph)
  const none = { hide: [], hideOrphans: false, maxLinks: null }
  it('hides filtered types but never the focus', () => {
    expect(filterPages(model, { ...none, hide: ['topic'] }, 0)).toEqual([
      true,
      false,
      true,
      true,
      true,
    ])
  })
  it('hides orphans and hubs above the cap', () => {
    expect(filterPages(model, { ...none, hideOrphans: true }, null)).toEqual([
      true,
      true,
      true,
      true,
      false,
    ])
    expect(filterPages(model, { ...none, maxLinks: 1 }, 2)).toEqual([
      true,
      false,
      true,
      true,
      true,
    ])
  })
})
