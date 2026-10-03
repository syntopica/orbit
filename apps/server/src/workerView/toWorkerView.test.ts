import type { WorkerStatus } from '../types/WorkerStatus'
import { toWorkerView } from './toWorkerView'

const NOW = 1_790_000_000_000
const queue = (
  states: Record<string, number>,
  oldest: number | null = null,
) => ({
  states,
  oldest_queued_s: oldest,
  done_1h: 0,
  wasted_1h_s: 0,
})
const status = (over: Partial<WorkerStatus> = {}): WorkerStatus => ({
  queues: {},
  nodes: {},
  cooldowns: {},
  recent_failures: [],
  ...over,
})

describe('toWorkerView', () => {
  it('maps a queue to counts and a millisecond age', () => {
    const view = toWorkerView(
      status({
        queues: {
          'queue.a': {
            ...queue(
              {
                queued: 2,
                leased: 1,
                running: 2,
                draining: 3,
                failed: 4,
                succeeded: 5,
              },
              1.5,
            ),
            done_1h: 7,
          },
        },
      }),
      NOW,
    )
    expect(view.queues).toEqual([
      {
        name: 'queue.a',
        queued: 2,
        live: 6,
        failed: 4,
        succeeded: 5,
        oldestQueuedMs: 1500,
        done1h: 7,
      },
    ])
    expect(view.now).toBe(NOW)
  })
  it('leaves failed sampling jobs out of the failed count', () => {
    const view = toWorkerView(
      status({
        queues: {
          'queue.a': { ...queue({ failed: 69 }), sampling_failed: 59 },
        },
      }),
      NOW,
    )
    expect(view.queues[0]?.failed).toBe(10)
  })
  it('sorts queues by queued, then failed, then name, and drops unsafe names', () => {
    const view = toWorkerView(
      status({
        queues: {
          'queue.f': queue({ failed: 9 }),
          'queue.b': queue({ queued: 1, failed: 1 }),
          'queue.a': queue({ queued: 1, failed: 2 }),
          'queue.d': queue({ queued: 5 }),
          'queue.c': queue({ failed: 9 }),
          'queue.e': queue({}),
          'bad name': queue({ queued: 99 }),
        },
      }),
      NOW,
    )
    expect(view.queues.map((q) => q.name)).toEqual([
      'queue.d',
      'queue.a',
      'queue.b',
      'queue.c',
      'queue.f',
      'queue.e',
    ])
    expect(view.queues[5]).toMatchObject({
      queued: 0,
      live: 0,
      oldestQueuedMs: null,
    })
  })
  it('maps nodes with nullable fields and keeps only allowlisted ones', () => {
    const view = toWorkerView(
      status({
        nodes: {
          'node-b': { age_s: 2 },
          'node-a': {
            reason: 'user_active',
            idle_s: 0.04,
            on_ac: false,
            pressure: 'warn',
            resident: ['model-a:7b', 'free text'],
            age_s: 24.8,
            last_release: { code: 'user_active', age_s: 8458.6 },
          },
          'bad node': { age_s: 1 },
        },
      }),
      NOW,
    )
    expect(view.nodes).toEqual([
      {
        name: 'node-a',
        reason: 'user_active',
        idleMs: 40,
        onAc: false,
        pressure: 'warn',
        resident: ['model-a:7b'],
        reportAgeMs: 24_800,
        lastRelease: { code: 'user_active', ageMs: 8_458_600 },
      },
      {
        name: 'node-b',
        reason: null,
        idleMs: null,
        onAc: null,
        pressure: null,
        resident: [],
        reportAgeMs: 2000,
        lastRelease: null,
      },
    ])
  })
  it('blanks unsafe codes and clamps negative ages', () => {
    const view = toWorkerView(
      status({
        nodes: {
          'node-a': {
            reason: 'two words',
            pressure: '',
            age_s: -3,
            idle_s: -1,
            last_release: { code: null, age_s: 1 },
          },
        },
      }),
      NOW,
    )
    expect(view.nodes[0]).toMatchObject({
      reason: null,
      pressure: null,
      reportAgeMs: 0,
      idleMs: 0,
      lastRelease: { code: null, ageMs: 1000 },
    })
  })
})
