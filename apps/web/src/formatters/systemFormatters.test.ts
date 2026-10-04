import { describe, expect, it } from 'vitest'
import { formatJobState } from './formatJobState'
import { formatSchedule } from './formatSchedule'

const row = {
  component: 'worker' as const,
  label: 'com.example.job',
  role: 'scheduled' as const,
  actions: [],
}

describe('system formatters', () => {
  it('describes a schedule', () => {
    expect(
      formatSchedule({
        ...row,
        schedule: { intervalS: 3_600, calendar: false, keepAlive: false },
      }),
    ).toBe('every 1h')
    expect(
      formatSchedule({
        ...row,
        schedule: { intervalS: 86_400, calendar: true, keepAlive: false },
      }),
    ).toBe('calendar')
    expect(
      formatSchedule({
        ...row,
        role: 'keepalive',
        schedule: { intervalS: null, calendar: false, keepAlive: true },
      }),
    ).toBe('kept alive')
    expect(
      formatSchedule({
        ...row,
        schedule: { intervalS: null, calendar: false, keepAlive: false },
      }),
    ).toBe('on demand')
    expect(formatSchedule({ ...row, schedule: null })).toBe('schedule unknown')
  })
  it('describes the current job state', () => {
    expect(formatJobState(null)).toBe('no reading yet')
    expect(
      formatJobState({ label: 'x', at: 1, runs: 3, lastExit: 0, pid: 42 }),
    ).toBe('running, pid 42')
    expect(
      formatJobState({ label: 'x', at: 1, runs: 3, lastExit: 0, pid: null }),
    ).toBe('last exit 0')
    expect(
      formatJobState({ label: 'x', at: 1, runs: 0, lastExit: null, pid: null }),
    ).toBe('never exited')
  })
})
