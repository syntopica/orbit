import type { MemoryFlow } from '@orbit/contract'
import { describe, expect, it, vi } from 'vitest'

import { particleDurationS } from '../charts/particleDurationS'
import { selectFlowGraph } from './selectFlowGraph'

const stage = (id: 'archive' | 'synthesis') => ({
  id,
  component: 'atrium' as const,
  state: 'ok' as const,
  freshAt: null,
  policyMs: null,
  label: null,
  lastRunAt: null,
  backlog: null,
  metrics: [],
  pending: [],
})
const flow: MemoryFlow = {
  now: 0,
  stages: [stage('archive'), stage('synthesis')],
  edges: [{ from: 'archive', to: 'synthesis', perHour: 24, flowing: true }],
}

describe('particleDurationS', () => {
  it.each([
    [null, null],
    [0, null],
    [24, 2.5],
    [1000, 1.5],
    [1, 12],
  ] as const)('maps %s per hour to %s s', (rate, seconds) => {
    expect(particleDurationS(rate)).toBe(seconds)
  })
})

describe('selectFlowGraph', () => {
  it('places stage nodes and animates only flowing edges when motion is allowed', () => {
    const onSelect = vi.fn()
    const graph = selectFlowGraph(flow, 'archive', onSelect, true)
    expect(graph.nodes.map((n) => [n.id, n.type, n.data.selected])).toEqual([
      ['archive', 'stage', true],
      ['synthesis', 'stage', false],
    ])
    expect(graph.edges[0]).toMatchObject({
      id: 'archive>synthesis',
      source: 'archive',
      target: 'synthesis',
      type: 'flow',
      data: { perHour: 24, durationS: 2.5 },
    })
    expect(
      selectFlowGraph(flow, null, onSelect, false).edges[0]?.data?.durationS,
    ).toBeNull()
  })
  it('keeps stopped rates visible and suppresses particles on stopped edges', () => {
    const stopped = {
      ...flow,
      edges: [
        {
          from: 'archive' as const,
          to: 'synthesis' as const,
          perHour: 24,
          flowing: false,
        },
      ],
    }
    expect(
      selectFlowGraph(stopped, null, vi.fn(), true).edges[0]?.data,
    ).toEqual({ perHour: 24, durationS: null })
  })
})
