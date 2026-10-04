import { describe, expect, it } from 'vitest'
import { validatePendingSearch } from './validatePendingSearch'

describe('validatePendingSearch', () => {
  it('keeps only bounded state, source and text filters', () => {
    expect(
      validatePendingSearch({
        state: 'blocked',
        source: 'todo:tasks',
        q: 'needle',
      }),
    ).toEqual({ state: 'blocked', source: 'todo:tasks', q: 'needle' })
    expect(
      validatePendingSearch({
        state: 'unknown',
        source: 'bad name',
        q: 'a'.repeat(501),
      }),
    ).toEqual({})
  })
})
