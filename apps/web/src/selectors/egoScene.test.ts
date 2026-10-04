import type { BrainGraph } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { computeLayout } from '../layout/computeLayout'
import type { GraphPalette } from '../types/GraphPalette'
import { buildGraphModel } from './buildGraphModel'
import { egoScene } from './egoScene'
import { pageSlots } from './pageSlots'

const palette: GraphPalette = {
  scheme: 'dark',
  series: ['#000001', '#000002', '#000003', '#000004', '#000005', '#000006'],
  warn: '#00000a',
  accent: '#00000b',
  line: '#00000c',
  ink: '#00000d',
}

// A hub linked to `spokes` pages, each linked to the hub only.
const star = (spokes: number) => {
  const edges = Array.from(
    { length: spokes },
    (_, index) => [0, index + 1] as [number, number],
  )
  const data: BrainGraph = {
    now: 0,
    nodes: Array.from({ length: spokes + 1 }, (_, index) => ({
      id: `notes/p${String(index)}`,
      type: 'topic',
      degree: index === 0 ? spokes : 1,
      orphan: false,
    })),
    edges,
    dangling: 0,
    skipped: 0,
  }
  const model = buildGraphModel(data)
  const layout = computeLayout({ order: spokes + 1, edges, seed: 1 })
  return egoScene(
    {
      model,
      layout,
      palette,
      slots: pageSlots(model, layout, 'type'),
      highlightOrphans: true,
      focus: 0,
    },
    Array.from({ length: spokes + 1 }, () => true),
    1,
  )
}

describe('egoScene labels', () => {
  it('labels every direct link while they are few', () => {
    expect(star(5).nodes.every((node) => node.forceLabel)).toBe(true)
  })
  it('stops forcing every direct link around a hub', () => {
    const forced = star(40).nodes.filter((node) => node.forceLabel)
    expect(forced.length).toBeLessThanOrEqual(16)
    expect(forced.some((node) => node.id === 'notes/p0')).toBe(true)
  })
})
