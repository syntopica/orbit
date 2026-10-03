import { describe, expect, it } from 'vitest'

import { validateWorkerSearch } from './validateWorkerSearch'

describe('validateWorkerSearch', () => {
  it('keeps 7d and defaults everything else to 24h', () => {
    expect(validateWorkerSearch({ range: '7d' })).toEqual({ range: '7d' })
    expect(validateWorkerSearch({ range: '30d' })).toEqual({ range: '24h' })
    expect(validateWorkerSearch({})).toEqual({ range: '24h' })
  })
})
