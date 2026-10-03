import { describe, expect, it } from 'vitest'

import { orbitPulsePeriod } from './orbitPulsePeriod'

describe('orbitPulsePeriod', () => {
  it('sets a quicker pulse for frequent readings', () => {
    expect(orbitPulsePeriod('synthetic')).toBe(1000)
    expect(orbitPulsePeriod('worker')).toBe(5000)
    expect(orbitPulsePeriod('launchd')).toBe(10_000)
    expect(orbitPulsePeriod('brain')).toBe(60_000)
    expect(orbitPulsePeriod('capture')).toBe(120_000)
  })
})
