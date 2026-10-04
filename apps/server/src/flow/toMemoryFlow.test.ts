import type { ComponentId, Snapshot } from '@orbit/contract'

import { atriumRefreshDocument } from '../test/atriumRefreshDocument'
import type { FlowInputs } from '../types/FlowInputs'
import { toMemoryFlow } from './toMemoryFlow'

const CLIPS_PENDING = 'clips.pending'
const CAPTURE_UNDRAINED = 'capture.undrained'
const NOT_INDEXED = 'atrium.not_indexed'
const NOW = 1_790_000_000_000
const DAY = 86_400_000
const iso = (at: number) => new Date(at).toISOString()
const atriumSnapshot: Snapshot = {
  component: 'atrium',
  health: { state: 'ok', reason: null },
  metrics: [
    { key: 'atrium.records', value: 50, at: iso(NOW) },
    { key: NOT_INDEXED, value: 3, at: iso(NOW) },
  ],
  pending: [{ key: NOT_INDEXED, count: 3, oldestAt: null }],
  events: [],
  observedAt: iso(NOW),
  lastGood: null,
}
const inputs: FlowInputs = {
  now: NOW,
  snapshots: new Map<ComponentId, Snapshot>([['atrium', atriumSnapshot]]),
  atrium: {
    refresh: atriumRefreshDocument({
      archive: { at: iso(NOW - 3 * 3_600_000) },
      refresh: { at: iso(NOW - 1_800_000) },
      content: { at: null },
    }),
    synthesis: null,
    doctor: null,
  },
  refreshIntervalMs: 3_600_000,
  labels: new Map([['curation' as const, 'com.example.curate']]),
  lastRuns: new Map([['com.example.curate', NOW - 8 * DAY]]),
  totals: new Map([
    ['archive>synthesis', 48],
    ['synthesis>index', null],
  ]),
}

describe('toMemoryFlow', () => {
  const flow = toMemoryFlow(inputs)
  const stage = (id: string) => flow.stages.find((s) => s.id === id)
  it('ages each stage against its policy', () => {
    expect(stage('index')).toMatchObject({
      state: 'ok',
      freshAt: NOW - 1_800_000,
      policyMs: 7_200_000,
      backlog: { key: NOT_INDEXED, value: 3 },
      pending: [{ key: NOT_INDEXED, count: 3, oldestAt: null }],
    })
    expect(stage('archive')?.state).toBe('warn')
    expect(stage('curation')).toMatchObject({
      state: 'warn',
      label: 'com.example.curate',
      lastRunAt: NOW - 8 * DAY,
    })
  })
  it('reads unmeasured and unconfigured stages as unknown', () => {
    expect(stage('retrieval')?.state).toBe('unknown')
    expect(stage('episodes')?.state).toBe('unknown')
    expect(stage('clips')).toMatchObject({ state: 'unknown', metrics: [] })
  })
  it('reads clips and capture counts from their own components', () => {
    const clips: Snapshot = {
      ...atriumSnapshot,
      component: 'clips',
      metrics: [{ key: CLIPS_PENDING, value: 2, at: iso(NOW) }],
      pending: [{ key: CLIPS_PENDING, count: 2, oldestAt: iso(NOW - DAY) }],
    }
    const capture: Snapshot = {
      ...clips,
      component: 'capture',
      metrics: [{ key: CAPTURE_UNDRAINED, value: 4, at: iso(NOW) }],
      pending: [{ key: CAPTURE_UNDRAINED, count: 4, oldestAt: iso(NOW) }],
    }
    const result = toMemoryFlow({
      ...inputs,
      snapshots: new Map<ComponentId, Snapshot>([
        ['clips', clips],
        ['capture', capture],
      ]),
    }).stages.find((item) => item.id === 'clips')
    expect(result).toMatchObject({
      state: 'ok',
      freshAt: NOW - DAY,
      backlog: { key: CLIPS_PENDING, value: 2 },
      metrics: [
        { key: CLIPS_PENDING, value: 2 },
        { key: CAPTURE_UNDRAINED, value: 4 },
      ],
    })
    const empty = toMemoryFlow({
      ...inputs,
      snapshots: new Map([['clips', { ...clips, pending: [] }]]),
    }).stages.find((item) => item.id === 'clips')
    expect(empty).toMatchObject({ freshAt: null, state: 'unknown' })
  })
  it('stops zero rates and emits unknown rates for unmeasured edges', () => {
    const result = toMemoryFlow({
      ...inputs,
      totals: new Map([['archive>synthesis', 0]]),
    })
    expect(result.edges[1]).toMatchObject({ perHour: 0, flowing: false })
    expect(result.edges[0]).toMatchObject({ perHour: null, flowing: false })
  })
  it('flows an edge with a positive rate and a fresh-enough upstream', () => {
    expect(flow.edges).toContainEqual({
      from: 'archive',
      to: 'synthesis',
      perHour: 2,
      flowing: false,
    })
    expect(flow.edges).toContainEqual({
      from: 'synthesis',
      to: 'index',
      perHour: null,
      flowing: false,
    })
    const fresh = toMemoryFlow({
      ...inputs,
      atrium: {
        refresh: atriumRefreshDocument({ archive: { at: iso(NOW) } }),
        synthesis: null,
        doctor: null,
      },
    })
    expect(fresh.edges[1]).toMatchObject({ perHour: 2, flowing: true })
  })
})
