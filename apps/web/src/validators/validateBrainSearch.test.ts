import { describe, expect, it } from 'vitest'

import { withPage } from '../selectors/withPage'
import { validateBrainSearch } from './validateBrainSearch'

describe('validateBrainSearch', () => {
  it('defaults every field', () => {
    expect(validateBrainSearch({})).toEqual({
      depth: 0,
      color: 'type',
      orphans: true,
      hide: [],
      range: '24h',
    })
  })
  it('keeps valid values and drops the rest', () => {
    expect(
      validateBrainSearch({
        page: 'notes/a',
        depth: 2,
        color: 'community',
        orphans: false,
        hide: ['topic', 3],
        range: '7d',
      }),
    ).toEqual({
      page: 'notes/a',
      depth: 2,
      color: 'community',
      orphans: false,
      hide: ['topic'],
      range: '7d',
    })
    expect(validateBrainSearch({ page: '../x', depth: 9 })).toEqual(
      validateBrainSearch({}),
    )
  })
  it('sets and clears the page', () => {
    const search = validateBrainSearch({ page: 'notes/a' })
    expect(withPage(search, 'notes/b').page).toBe('notes/b')
    expect('page' in withPage(search, null)).toBe(false)
  })
})
