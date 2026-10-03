import { describe, expect, it } from 'vitest'

import { validateMemorySearch } from './validateMemorySearch'

describe('validateMemorySearch', () => {
  it('keeps a known stage and drops anything else', () => {
    expect(validateMemorySearch({ stage: 'index' })).toEqual({ stage: 'index' })
    expect(validateMemorySearch({ stage: 'nowhere' })).toEqual({})
    expect(validateMemorySearch({})).toEqual({})
  })
})
