import type { OrbitEvent } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { eventMessages } from '../test/eventMessages'
import { collapseTicker } from './collapseTicker'

const STOPPED = 'launchd.stopped'
const STARTED = 'launchd.started'
const EXIT = 'launchd.exit_changed'

const at = (seconds: number) =>
  new Date(Date.UTC(2026, 9, 2, 10, 0, seconds)).toISOString()
const ev = (
  kind: OrbitEvent['kind'],
  seconds: number,
  label = 'com.example.job',
): OrbitEvent => ({
  at: at(seconds),
  component: 'launchd',
  kind,
  severity: 'info',
  refs: { label },
})
const shape = (events: OrbitEvent[]) =>
  collapseTicker(eventMessages(events)).map((row) => [
    row.event.kind,
    row.ranMs,
  ])

describe('collapseTicker', () => {
  it('folds a stop and the start just before it into one ran row', () => {
    expect(shape([ev(STOPPED, 70), ev(STARTED, 10)])).toEqual([
      [STOPPED, 60_000],
    ])
  })
  it('folds at exactly five minutes but not past them', () => {
    expect(shape([ev(STOPPED, 300), ev(STARTED, 0)])).toEqual([
      [STOPPED, 300_000],
    ])
    expect(shape([ev(STOPPED, 301), ev(STARTED, 0)])).toEqual([
      [STOPPED, null],
      [STARTED, null],
    ])
  })
  it('never folds different labels, reversed order or a start after the stop', () => {
    expect(
      shape([ev(STOPPED, 70), ev(STARTED, 10, 'com.example.other')]),
    ).toEqual([
      [STOPPED, null],
      [STARTED, null],
    ])
    expect(shape([ev(STARTED, 70), ev(STOPPED, 10)])).toEqual([
      [STARTED, null],
      [STOPPED, null],
    ])
    expect(shape([ev(STOPPED, 10), ev(STARTED, 70)])).toEqual([
      [STOPPED, null],
      [STARTED, null],
    ])
  })
  it('folds only a stop into the start before it', () => {
    expect(shape([ev(EXIT, 70), ev(STARTED, 10)])).toEqual([
      [EXIT, null],
      [STARTED, null],
    ])
  })
  it('folds each pair once and leaves other events in place', () => {
    expect(
      shape([
        ev(EXIT, 70),
        ev(STOPPED, 70),
        ev(STARTED, 10),
        ev(STARTED, 5),
        ev(STOPPED, 4),
        ev(STARTED, 0),
      ]),
    ).toEqual([
      [EXIT, null],
      [STOPPED, 60_000],
      [STARTED, null],
      [STOPPED, 4000],
    ])
  })
  it('folds a zero-length run and keeps an empty list empty', () => {
    expect(shape([ev(STOPPED, 1), ev(STARTED, 1)])).toEqual([[STOPPED, 0]])
    expect(shape([])).toEqual([])
  })
})
