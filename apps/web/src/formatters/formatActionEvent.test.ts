import type { OrbitEvent } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { formatActionEvent } from './formatActionEvent'

describe('formatActionEvent', () => {
  const base: OrbitEvent = {
    at: '2026-10-02T10:00:00.000Z',
    component: 'launchd',
    kind: 'action.started',
    severity: 'info',
    refs: {
      target: 'com.example.job',
      kind: 'run',
      id: 'run-1',
      exitCode: -1,
      durationMs: 0,
    },
  }
  it('describes each action outcome using bounded metadata', () => {
    expect(formatActionEvent(base)).toBe('com.example.job run started')
    expect(
      formatActionEvent({
        ...base,
        kind: 'action.succeeded',
        refs: { ...base.refs, durationMs: 12000 },
      }),
    ).toBe('com.example.job run succeeded in 12s')
    expect(
      formatActionEvent({
        ...base,
        kind: 'action.failed',
        refs: { ...base.refs, exitCode: 1 },
      }),
    ).toBe('com.example.job run failed (exit 1)')
  })
  it('refuses unrelated or incomplete events', () => {
    expect(formatActionEvent({ ...base, kind: 'launchd.started' })).toBeNull()
    expect(
      formatActionEvent({ ...base, refs: { target: 'com.example.job' } }),
    ).toBeNull()
    expect(formatActionEvent({ ...base, refs: { kind: 'run' } })).toBeNull()
  })
})
