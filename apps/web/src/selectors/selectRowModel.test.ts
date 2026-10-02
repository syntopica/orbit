import { describe, expect, it } from 'vitest'

import { observation as obs } from '../test/launchdObservation'
import type { LaunchdRow } from '../types/LaunchdRow'
import { selectRowModel } from './selectRowModel'

const now = 48 * 30 * 60_000
const H = 3_600_000
const row: LaunchdRow = {
  component: 'worker',
  label: 'com.example.job',
  role: 'scheduled',
  schedule: { intervalS: 3_600, calendar: false, keepAlive: false },
}

describe('selectRowModel', () => {
  it('summarises a healthy day', () => {
    const history = {
      now,
      observations: [obs(now - 40 * 60_000, 1, 0)],
      runs: [{ started: 0, stopped: now }],
    }
    const model = selectRowModel(history, { ...row, schedule: null }, '24h')
    expect(model.summary).toBe('com.example.job, last 24 hours: all healthy')
    expect(model.state).toBe('last exit 0')
  })
  it('counts the unhealthy buckets by state', () => {
    const history = {
      now,
      observations: [obs(now - 5 * H, 3, 0)],
      runs: [{ started: now - 6 * H, stopped: now }],
    }
    const { summary } = selectRowModel(history, row, '24h')
    expect(summary).toMatch(
      /^com\.example\.job, last 24 hours: \d+ missed, \d+ not observed$/,
    )
  })
})
