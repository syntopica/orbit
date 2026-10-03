import { describe, expect, it } from 'vitest'

import { orbitColorToken } from './orbitColorToken'

describe('orbitColorToken', () => {
  it('uses the existing semantic tokens and dims stale readings', () => {
    expect(orbitColorToken({ state: 'ok', greyed: false })).toBe('--color-ok')
    expect(orbitColorToken({ state: 'warn', greyed: false })).toBe(
      '--color-warn',
    )
    expect(orbitColorToken({ state: 'down', greyed: false })).toBe(
      '--color-down',
    )
    expect(orbitColorToken({ state: 'down', greyed: true })).toBe(
      '--color-unknown',
    )
  })
})
