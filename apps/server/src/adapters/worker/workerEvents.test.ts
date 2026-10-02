import { workerEvents } from './workerEvents'

const status = (
  failures: string[],
  cooldowns: string[],
  error = 'runner_failed',
) => ({
  queues: {},
  nodes: {},
  cooldowns: Object.fromEntries(cooldowns.map((c) => [c, 10])),
  recent_failures: failures.map((id) => ({
    id,
    queue: 'q.a',
    error,
    finished: 1,
  })),
})
const now = new Date('2026-10-02T10:00:00.000Z')

describe('workerEvents', () => {
  it('reports only failures and cooldowns new since the previous read', () => {
    expect(workerEvents(null, status(['j1'], ['agy']), now)).toEqual([])
    const seen = { failures: new Set(['j1']), cooldowns: new Set(['agy']) }
    const events = workerEvents(
      seen,
      status(['j1', 'j2'], ['agy', 'cursor']),
      now,
    )
    expect(events.map((e) => [e.kind, e.refs])).toEqual([
      ['worker.job_failed', { job: 'j2', queue: 'q.a' }],
      ['worker.cooldown_started', { runner: 'cursor' }],
    ])
  })
  it('never copies the free-text error into an event', () => {
    const seen = { failures: new Set<string>(), cooldowns: new Set<string>() }
    const events = workerEvents(
      seen,
      status(['j2'], [], 'LEAKED provider text'),
      now,
    )
    expect(JSON.stringify(events)).not.toContain('LEAKED')
    expect(events[0]).toMatchObject({ severity: 'warn', at: now.toISOString() })
  })
  it('drops refs that are not safe and skips unsafe runners', () => {
    const seen = { failures: new Set<string>(), cooldowns: new Set<string>() }
    const events = workerEvents(seen, status(['bad id'], ['bad runner']), now)
    expect(events).toHaveLength(1)
    expect(events[0]?.refs).toEqual({ queue: 'q.a' })
  })
  it('marks a cooldown as info', () => {
    const seen = { failures: new Set<string>(), cooldowns: new Set<string>() }
    expect(workerEvents(seen, status([], ['agy']), now)[0]?.severity).toBe(
      'info',
    )
  })
})
