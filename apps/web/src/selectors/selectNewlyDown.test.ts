import { describe, expect, it } from 'vitest'

import { snapshotOf } from '../test/snapshotOf'
import { selectNewlyDown } from './selectNewlyDown'

describe('selectNewlyDown', () => {
  it('lists components that just went down', () => {
    const previous = {
      worker: snapshotOf('worker', 'ok'),
      launchd: snapshotOf('launchd', 'down'),
    }
    const next = {
      worker: snapshotOf('worker', 'down'),
      launchd: snapshotOf('launchd', 'down'),
      synthetic: snapshotOf('synthetic', 'down'),
    }
    expect(selectNewlyDown(previous, next)).toEqual(['worker', 'synthetic'])
  })
  it('ignores components that are up or recovered', () => {
    const previous = { worker: snapshotOf('worker', 'down') }
    const next = {
      worker: snapshotOf('worker', 'ok'),
      brain: snapshotOf('brain', 'warn'),
    }
    expect(selectNewlyDown(previous, next)).toEqual([])
  })
})
