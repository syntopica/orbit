import { describe, expect, it } from 'vitest'

import { workerNode } from '../test/workerNode'
import { workerQueue, workerView } from '../test/workerView'
import { diagnoseWorker } from './diagnoseWorker'

const NOW = 1_790_000_000_000
const waiting = [
  workerQueue({ queued: 3 }),
  workerQueue({ name: 'queue.b', queued: 2 }),
]
const kinds = (view: Parameters<typeof diagnoseWorker>[0]) =>
  diagnoseWorker(view).blockers.map((b) => [b.kind, b.subject, b.ms, b.code])

describe('diagnoseWorker', () => {
  it('is idle when nothing is queued, whatever else is wrong', () => {
    const view = workerView({
      queues: [workerQueue({ failed: 4, live: 1 })],
      cooldowns: [{ runner: 'runner-a', availableAt: NOW + 1 }],
    })
    expect(diagnoseWorker(view)).toEqual({
      state: 'idle',
      queued: 0,
      live: 1,
      done1h: 0,
      blockers: [],
    })
  })
  it('is working when something runs, still naming what holds the rest', () => {
    const view = workerView({
      queues: [...waiting, workerQueue({ live: 1 })],
      nodes: [workerNode()],
      cooldowns: [{ runner: 'runner-a', availableAt: NOW + 60_000 }],
    })
    expect(diagnoseWorker(view)).toEqual({
      state: 'working',
      queued: 5,
      live: 1,
      done1h: 0,
      blockers: [
        { kind: 'cooldown', subject: 'runner-a', ms: 60_000, code: null },
      ],
    })
  })
  it('sums the work done in the last hour, so a gap between jobs is not a stall', () => {
    const view = workerView({
      queues: [
        workerQueue({ queued: 3, done1h: 13 }),
        workerQueue({ name: 'queue.b', done1h: 3 }),
      ],
      nodes: [workerNode()],
    })
    expect(diagnoseWorker(view)).toMatchObject({ state: 'blocked', done1h: 16 })
  })
  it('lists cooldowns against the server clock, never negative', () => {
    const view = workerView({
      queues: waiting,
      nodes: [workerNode()],
      cooldowns: [
        { runner: 'runner-a', availableAt: NOW + 60_000 },
        { runner: 'runner-b', availableAt: NOW - 5 },
      ],
    })
    expect(diagnoseWorker(view)).toMatchObject({
      state: 'blocked',
      queued: 5,
      live: 0,
    })
    expect(kinds(view)).toEqual([
      ['cooldown', 'runner-a', 60_000, null],
      ['cooldown', 'runner-b', 0, null],
    ])
  })
  it('asks why even for a single queued job', () => {
    expect(
      diagnoseWorker(workerView({ queues: [workerQueue({ queued: 1 })] }))
        .state,
    ).toBe('blocked')
  })
  it('says no node has reported', () => {
    expect(kinds(workerView({ queues: waiting }))).toEqual([
      ['no_nodes', null, null, null],
    ])
  })
  it('finds no cause when a fresh node is ready', () => {
    expect(
      kinds(workerView({ queues: waiting, nodes: [workerNode()] })),
    ).toEqual([])
  })
  it('reports only silence for a stale node', () => {
    const stale = workerNode({
      reportAgeMs: 300_001,
      onAc: false,
      reason: 'drain_failed',
    })
    const edge = workerNode({ name: 'node-b', reportAgeMs: 300_000 })
    expect(
      kinds(workerView({ queues: waiting, nodes: [stale, edge] })),
    ).toEqual([['stale', 'node-a', 300_001, null]])
  })
  it('sees a person at the machine only after a user_active release and under 5 minutes idle', () => {
    const release = { code: 'user_active', ageMs: 1000 }
    const nodes = [
      workerNode({ name: 'n1', lastRelease: release, idleMs: 299_999 }),
      workerNode({ name: 'n2', lastRelease: release, idleMs: 300_000 }),
      workerNode({ name: 'n3', lastRelease: release, idleMs: null }),
      workerNode({
        name: 'n4',
        lastRelease: { code: 'on_battery', ageMs: 1 },
        idleMs: 0,
      }),
      workerNode({ name: 'n5', idleMs: 0 }),
    ]
    expect(kinds(workerView({ queues: waiting, nodes }))).toEqual([
      ['in_use', 'n1', null, null],
    ])
  })
  it('names battery, pressure and other block reasons once each', () => {
    const nodes = [
      workerNode({ name: 'n1', onAc: false, reason: 'on_battery' }),
      workerNode({ name: 'n2', reason: 'on_battery' }),
      workerNode({ name: 'n3', onAc: null }),
      workerNode({ name: 'n4', pressure: 'warn', reason: 'memory_pressure' }),
      workerNode({ name: 'n5', reason: 'pressure_recovering' }),
      workerNode({ name: 'n6', reason: 'pressure_backoff' }),
      workerNode({ name: 'n7', pressure: null }),
      workerNode({ name: 'n8', reason: 'drain_failed' }),
    ]
    expect(kinds(workerView({ queues: waiting, nodes }))).toEqual([
      ['battery', 'n1', null, null],
      ['battery', 'n2', null, null],
      ['pressure', 'n4', null, null],
      ['pressure', 'n5', null, null],
      ['pressure', 'n6', null, null],
      ['blocked', 'n8', null, 'drain_failed'],
    ])
  })
  it('orders a node with several causes: in use, battery, pressure, other', () => {
    const node = workerNode({
      onAc: false,
      pressure: 'critical',
      reason: 'backend_down',
      idleMs: 1,
      lastRelease: { code: 'user_active', ageMs: 1 },
    })
    expect(
      kinds(workerView({ queues: waiting, nodes: [node] })).map((k) => k[0]),
    ).toEqual(['in_use', 'battery', 'pressure', 'blocked'])
  })
})
