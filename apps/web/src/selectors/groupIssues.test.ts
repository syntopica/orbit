import { describe, expect, it } from 'vitest'

import { groupIssues } from './groupIssues'

describe('groupIssues', () => {
  it('groups pages by code, largest group first', () => {
    expect(
      groupIssues([
        { page: 'notes/a', code: 'missing_summary' },
        { page: 'notes/b', code: 'dangling_link' },
        { page: 'notes/c', code: 'dangling_link' },
      ]),
    ).toEqual([
      { code: 'dangling_link', pages: ['notes/b', 'notes/c'] },
      { code: 'missing_summary', pages: ['notes/a'] },
    ])
  })
  it('orders equally sized groups by code and accepts no issues', () => {
    expect(
      groupIssues([
        { page: 'notes/z', code: 'z' },
        { page: 'notes/a', code: 'a' },
      ]),
    ).toEqual([
      { code: 'a', pages: ['notes/a'] },
      { code: 'z', pages: ['notes/z'] },
    ])
    expect(groupIssues([])).toEqual([])
  })
})
