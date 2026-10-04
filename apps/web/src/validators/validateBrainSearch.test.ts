import { describe, expect, it } from 'vitest'

import { withPage } from '../selectors/withPage'
import { validateBrainSearch } from './validateBrainSearch'

describe('validateBrainSearch', () => {
  it('defaults every field', () => {
    expect(validateBrainSearch({})).toEqual({
      depth: 1,
      color: 'type',
      orphans: true,
      hide: [],
      hideOrphans: false,
      maxLinks: null,
      cluster: null,
      scene: '2d',
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
        hideOrphans: true,
        maxLinks: 40,
        cluster: -1,
        scene: '3d',
        range: '7d',
      }),
    ).toEqual({
      page: 'notes/a',
      depth: 2,
      color: 'community',
      orphans: false,
      hide: ['topic'],
      hideOrphans: true,
      maxLinks: 40,
      cluster: -1,
      scene: '3d',
      range: '7d',
    })
    expect(
      validateBrainSearch({
        page: '../x',
        depth: 9,
        maxLinks: 0.5,
        cluster: -2,
        scene: '4d',
      }),
    ).toEqual(validateBrainSearch({}))
  })
  it('sets and clears the page', () => {
    const search = validateBrainSearch({ page: 'notes/a' })
    expect(withPage(search, 'notes/b').page).toBe('notes/b')
    expect('page' in withPage(search, null)).toBe(false)
  })
})
