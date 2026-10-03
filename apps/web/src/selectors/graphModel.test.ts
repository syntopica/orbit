import type { BrainGraph } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { UNTYPED } from '../charts/untypedType'
import { buildGraphModel } from './buildGraphModel'
import { neighbourhood } from './neighbourhood'
import { visibleNodes } from './visibleNodes'

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

describe('neighbourhood', () => {
  it('walks up to depth steps in either direction', () => {
    const { neighbours } = buildGraphModel(graph)
    expect(
      [...neighbourhood(neighbours, 0, 1)].toSorted((a, b) => a - b),
    ).toEqual([0, 1])
    expect(
      [...neighbourhood(neighbours, 0, 3)].toSorted((a, b) => a - b),
    ).toEqual([0, 1, 2, 3])
    expect([...neighbourhood(neighbours, 4, 3)]).toEqual([4])
  })
})

describe('visibleNodes', () => {
  const model = buildGraphModel(graph)
  it('hides filtered types but never the focus', () => {
    expect(visibleNodes(model, ['topic'], 0, 0)).toEqual([
      true,
      false,
      true,
      true,
      true,
    ])
  })
  it('limits a local view to the neighbourhood of the focus', () => {
    expect(visibleNodes(model, [], 1, 1)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ])
    expect(visibleNodes(model, [], null, 2)).toEqual([
      true,
      true,
      true,
      true,
      true,
    ])
  })
})
