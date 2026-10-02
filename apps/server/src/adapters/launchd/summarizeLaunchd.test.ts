import type { LabelReading } from '../../types/LabelReading'
import { summarizeLaunchd } from './summarizeLaunchd'

const entry = (label: string, role: 'scheduled' | 'keepalive') => ({
  component: 'worker' as const,
  label,
  role,
  plist: '/x',
})
const reading = (
  label: string,
  state: LabelReading['state'],
  loaded = true,
  extra: {
    role?: 'scheduled' | 'keepalive'
    error?: LabelReading['error']
  } = {},
): LabelReading => ({
  entry: entry(label, extra.role ?? 'scheduled'),
  loaded,
  state,
  error: extra.error ?? null,
})
const failing = (r: LabelReading) =>
  summarizeLaunchd([r], new Date()).metrics.find(
    (m) => m.key === 'launchd.failing',
  )?.value

describe('summarizeLaunchd', () => {
  it('counts jobs, running and failing', () => {
    const summary = summarizeLaunchd(
      [
        reading('a', { state: 'running', pid: 1, runs: 1, lastExit: null }),
        reading('b', {
          state: 'not running',
          pid: null,
          runs: 2,
          lastExit: 78,
        }),
        reading('c', null, false),
        reading('d', { state: 'not running', pid: null, runs: 2, lastExit: 0 }),
      ],
      new Date('2026-10-02T10:00:00.000Z'),
    )
    const value = (key: string) =>
      summary.metrics.find((m) => m.key === key)?.value
    expect([
      value('launchd.jobs'),
      value('launchd.running'),
      value('launchd.failing'),
    ]).toEqual([4, 1, 2])
    expect(summary.health).toEqual({ state: 'warn', reason: 'check_failed' })
    expect(summary.pending).toEqual([
      { key: 'launchd.failing_jobs', count: 2, oldestAt: null },
    ])
  })
  it('is ok when nothing fails', () => {
    const summary = summarizeLaunchd(
      [reading('a', { state: 'running', pid: 1, runs: 1, lastExit: null })],
      new Date(),
    )
    expect(summary.health).toEqual({ state: 'ok', reason: null })
    expect(summary.pending).toEqual([])
  })
  it('does not fail a running job that carries an old non-zero exit', () => {
    expect(
      failing(
        reading('a', { state: 'running', pid: 9, runs: 1, lastExit: 78 }),
      ),
    ).toBe(0)
  })
  it('does not fail a job that never exited', () => {
    expect(
      failing(
        reading('a', { state: 'waiting', pid: null, runs: 0, lastExit: null }),
      ),
    ).toBe(0)
  })
  it('fails a job with no pid and a non-zero exit', () => {
    expect(
      failing(
        reading('a', { state: 'waiting', pid: null, runs: 1, lastExit: 1 }),
      ),
    ).toBe(1)
  })
  it('fails a keepalive job without a pid whatever its last exit', () => {
    const idle = { state: 'waiting', pid: null, runs: 1 }
    expect(
      failing(
        reading('k', { ...idle, lastExit: 0 }, true, { role: 'keepalive' }),
      ),
    ).toBe(1)
    expect(
      failing(
        reading('k', { ...idle, lastExit: null }, true, { role: 'keepalive' }),
      ),
    ).toBe(1)
  })
  it('does not fail a keepalive job with a pid', () => {
    expect(
      failing(
        reading(
          'k',
          { state: 'running', pid: 3, runs: 1, lastExit: 78 },
          true,
          { role: 'keepalive' },
        ),
      ),
    ).toBe(0)
  })
  it('fails an unreadable label', () => {
    expect(failing(reading('u', null, false, { error: 'timeout' }))).toBe(1)
  })
})
