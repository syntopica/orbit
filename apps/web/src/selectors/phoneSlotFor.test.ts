import { describe, expect, it } from 'vitest'

import { phoneSlotFor } from './phoneSlotFor'

describe('phoneSlotFor', () => {
  it.each([
    ['/', '/'],
    ['/memory', '/memory'],
    ['/worker', '/worker'],
    ['/worker/jobs', '/worker'],
    ['/worker/jobs/example', '/worker'],
    ['/pending', '/pending'],
    ['/atrium', 'more'],
    ['/brain', 'more'],
    ['/clips', 'more'],
    ['/system', 'more'],
  ] as const)('selects %s as %s', (path, slot) => {
    expect(phoneSlotFor(path)).toBe(slot)
  })
})
