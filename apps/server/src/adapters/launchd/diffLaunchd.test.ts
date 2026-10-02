import type { LabelReading } from '../../types/LabelReading'
import { diffLaunchd } from './diffLaunchd'

const at = new Date('2026-10-02T10:00:00.000Z')
const label = 'com.example.job'
const reading = (
  pid: number | null,
  lastExit: number | null,
  loaded = true,
): LabelReading => ({
  entry: { component: 'worker', label, role: 'keepalive', plist: '/x' },
  loaded,
  error: null,
  state: loaded ? { state: 'x', pid, runs: 1, lastExit } : null,
})
const prev = (r: LabelReading) => new Map([[label, r]])

describe('diffLaunchd', () => {
  it('emits nothing on the first reading', () => {
    expect(diffLaunchd(new Map(), [reading(1, null)], at)).toEqual([])
  })
  it('emits start, stop and exit changes', () => {
    const before = new Map([[label, reading(null, 0)]])
    expect(diffLaunchd(before, [reading(5, 0)], at).map((e) => e.kind)).toEqual(
      ['launchd.started'],
    )
    const running = new Map([[label, reading(5, 0)]])
    const events = diffLaunchd(running, [reading(null, 78)], at)
    expect(events.map((e) => e.kind)).toEqual([
      'launchd.stopped',
      'launchd.exit_changed',
    ])
    expect(events[1]?.refs).toEqual({ label, exit: 78 })
    expect(events[1]?.severity).toBe('warn')
  })
  it('emits an info exit change for a clean exit', () => {
    const events = diffLaunchd(prev(reading(null, 78)), [reading(null, 0)], at)
    expect(events.map((e) => [e.kind, e.severity])).toEqual([
      ['launchd.exit_changed', 'info'],
    ])
  })
  it('emits nothing when nothing changed', () => {
    expect(diffLaunchd(prev(reading(5, 0)), [reading(5, 0)], at)).toEqual([])
  })
  it('emits stopped when a running label is unloaded', () => {
    const events = diffLaunchd(
      prev(reading(5, 0)),
      [reading(null, null, false)],
      at,
    )
    expect(events.map((e) => e.kind)).toEqual(['launchd.stopped'])
  })
  it('emits started when an unloaded label runs', () => {
    const events = diffLaunchd(
      prev(reading(null, null, false)),
      [reading(5, 0)],
      at,
    )
    expect(events.map((e) => e.kind)).toEqual(['launchd.started'])
  })
  it('emits nothing for an unreadable label', () => {
    const bad: LabelReading = {
      ...reading(null, null, false),
      error: 'timeout',
    }
    expect(diffLaunchd(prev(reading(5, 0)), [bad], at)).toEqual([])
  })
})
