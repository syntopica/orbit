import { describe, expect, it } from 'vitest'
import { observation as obs } from '../test/launchdObservation'
import type { LaunchdRow } from '../types/LaunchdRow'
import { buildHeartbeat } from './buildHeartbeat'

const H = 3_600_000
const now = 48 * 30 * 60_000
const scheduled: LaunchdRow = {
  component: 'worker',
  label: 'com.example.job',
  role: 'scheduled',
  schedule: { intervalS: 3_600, calendar: false, keepAlive: false },
}

describe('buildHeartbeat', () => {
  it('builds 48 buckets for a day with unknown before orbit started', () => {
    const history = {
      observations: [obs(now - 3 * H, 1, 0), obs(now - 2 * H + 60_000, 2, 0)],
      runs: [{ started: now - 4 * H, stopped: now }],
    }
    const buckets = buildHeartbeat(history, scheduled, '24h', now)
    expect(buckets).toHaveLength(48)
    expect(buckets[0]?.state).toBe('unknown')
    expect(buckets.at(-4)?.state).toBe('ok')
    expect(buckets.at(-1)?.state).toBe('missed')
  })
  it('marks missed even when orbit never saw the job run', () => {
    const history = {
      observations: [obs(now - 5 * H, 3, 0)],
      runs: [{ started: now - 6 * H, stopped: now }],
    }
    expect(buildHeartbeat(history, scheduled, '24h', now).at(-1)?.state).toBe(
      'missed',
    )
  })
  it('does not mark missed without a baseline reading', () => {
    const history = {
      observations: [],
      runs: [{ started: now - 6 * H, stopped: now }],
    }
    expect(buildHeartbeat(history, scheduled, '24h', now).at(-1)?.state).toBe(
      'idle',
    )
  })
  it('does not mark missed for a job without an interval', () => {
    const row = {
      ...scheduled,
      schedule: { intervalS: null, calendar: true, keepAlive: false },
    }
    const history = {
      observations: [obs(now - 5 * H, 3, 0)],
      runs: [{ started: now - 6 * H, stopped: now }],
    }
    expect(buildHeartbeat(history, row, '24h', now).at(-1)?.state).toBe('idle')
    expect(
      buildHeartbeat(history, { ...row, schedule: null }, '24h', now).at(-1)
        ?.state,
    ).toBe('idle')
  })
  it('does not mark missed when the job ran inside 1.5 intervals', () => {
    const history = {
      observations: [obs(now - 5 * H, 3, 0), obs(now - 1.2 * H, 4, 0)],
      runs: [{ started: now - 6 * H, stopped: now }],
    }
    expect(buildHeartbeat(history, scheduled, '24h', now).at(-1)?.state).toBe(
      'idle',
    )
  })
  it('marks a keepalive job ok with a pid and failed without', () => {
    const row: LaunchdRow = {
      ...scheduled,
      role: 'keepalive',
      schedule: { intervalS: null, calendar: false, keepAlive: true },
    }
    const runs = [{ started: now - 6 * H, stopped: now }]
    expect(
      buildHeartbeat(
        { observations: [obs(now - H, 1, 0, 42)], runs },
        row,
        '24h',
        now,
      ).at(-1)?.state,
    ).toBe('ok')
    expect(
      buildHeartbeat(
        { observations: [obs(now - H, 1, 0, null)], runs },
        row,
        '24h',
        now,
      ).at(-1)?.state,
    ).toBe('failed')
  })
  it('holds a bucket to the readings inside it, with the last one at its end', () => {
    const width = 30 * 60_000
    const first = now - 86_400_000
    const history = {
      observations: [obs(first + width, 1, 78)],
      runs: [{ started: 0, stopped: now }],
    }
    const states = buildHeartbeat(history, scheduled, '24h', now).map(
      (b) => b.state,
    )
    expect(states[0]).toBe('idle')
    expect(states[1]).toBe('failed')
    expect(states[2]).toBe('failed')
  })
  it.each([
    ['24h', 48, 86_400_000],
    ['7d', 84, 7 * 86_400_000],
    ['30d', 90, 30 * 86_400_000],
  ] as const)(
    'builds the %s range as %i contiguous buckets',
    (range, count, span) => {
      const buckets = buildHeartbeat(
        { observations: [], runs: [] },
        scheduled,
        range,
        now,
      )
      expect(buckets).toHaveLength(count)
      expect(buckets[0]?.start).toBe(now - span)
      expect(buckets.at(-1)?.end).toBeCloseTo(now, 3)
      expect(buckets[1]?.start).toBe(buckets[0]?.end)
    },
  )
})

describe('buildHeartbeat bucket edges', () => {
  const width = 30 * 60_000
  const first = now - 86_400_000
  const runs = [{ started: 0, stopped: now }]
  const plain = { ...scheduled, schedule: null }
  const statesOf = (observations: ReturnType<typeof obs>[], row = plain) =>
    buildHeartbeat({ observations, runs }, row, '24h', now).map((b) => b.state)

  it('puts a reading at the start of a bucket into that bucket', () => {
    const states = statesOf([
      obs(first + width, 1, 78),
      obs(first + width + 1, 1, 0),
    ])
    expect(states.slice(0, 3)).toEqual(['idle', 'failed', 'idle'])
  })
  it('puts a run at the start of a bucket into that bucket only', () => {
    const states = statesOf([
      obs(first + width - 1_000, 1, 0),
      obs(first + width, 2, 0),
    ])
    expect(states.slice(0, 3)).toEqual(['idle', 'ok', 'idle'])
  })
  it('treats a negative exit code as a failure', () => {
    expect(statesOf([obs(first + width + 1, 1, -9)])[1]).toBe('failed')
  })
})
