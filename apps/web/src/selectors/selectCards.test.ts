import { describe, expect, it } from 'vitest'

import { snapshotOf } from '../test/snapshotOf'
import { selectCards } from './selectCards'

const AT = '2026-10-02T10:00:00.000Z'

const OK = 'ok'
const WORKER = 'worker'
const LIVE = 'worker.live'

describe('selectCards', () => {
  it('orders cards by component and labels the headline', () => {
    const worker = snapshotOf(WORKER, OK, {
      metrics: [{ key: LIVE, value: 3, at: AT }],
    })
    const cards = selectCards({
      synthetic: snapshotOf('synthetic', OK),
      worker,
    })
    expect(cards.map((c) => c.component)).toEqual([WORKER, 'synthetic'])
    expect(cards[0]).toMatchObject({
      label: 'Worker',
      state: OK,
      headline: '3 running',
      greyed: false,
      reason: null,
    })
    expect(cards[1]?.headline).toBeNull()
  })
  it('keeps the last good reading of a down component, greyed', () => {
    const good = snapshotOf(WORKER, OK, {
      metrics: [{ key: LIVE, value: 2, at: '2026-10-02T09:00:00.000Z' }],
    })
    const { lastGood: _ignored, ...core } = good
    const down = snapshotOf(WORKER, 'down', {
      lastGood: { ...core, observedAt: '2026-10-02T09:00:00.000Z' },
    })
    expect(selectCards({ worker: down })[0]).toMatchObject({
      state: 'down',
      reason: 'Unreachable',
      headline: '2 running',
      observedAt: '2026-10-02T09:00:00.000Z',
      greyed: true,
    })
  })
  it('does not grey a down component that never had a good reading', () => {
    expect(
      selectCards({ worker: snapshotOf(WORKER, 'down') })[0],
    ).toMatchObject({
      state: 'down',
      headline: null,
      observedAt: AT,
      greyed: false,
    })
  })
  it('ignores last good of a component that is not down', () => {
    const { lastGood: _ignored, ...core } = snapshotOf(WORKER, OK, {
      metrics: [{ key: LIVE, value: 9, at: AT }],
    })
    const warn = snapshotOf(WORKER, 'warn', {
      metrics: [{ key: LIVE, value: 1, at: AT }],
      lastGood: core,
    })
    expect(selectCards({ worker: warn })[0]).toMatchObject({
      headline: '1 running',
      greyed: false,
    })
  })
})
