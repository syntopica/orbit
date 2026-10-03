import { describe, expect, it } from 'vitest'

import { internalPageOf } from './internalPageOf'
import { wikiTextNodes } from './wikiTextNodes'

describe('wikiTextNodes', () => {
  it('links valid page ids and keeps labels as literal text', () => {
    expect(
      wikiTextNodes('See [[notes/a]] and [[notes/b|the B page]].'),
    ).toEqual([
      { type: 'text', value: 'See ' },
      {
        type: 'link',
        url: '/brain?page=notes%2Fa',
        children: [{ type: 'text', value: 'notes/a' }],
      },
      { type: 'text', value: ' and ' },
      {
        type: 'link',
        url: '/brain?page=notes%2Fb',
        children: [{ type: 'text', value: 'the B page' }],
      },
      { type: 'text', value: '.' },
    ])
  })
  it('turns a target outside the pattern into plain text', () => {
    expect(wikiTextNodes('[[../x|escape]] [[bad id]]')).toEqual([
      { type: 'text', value: 'escape' },
      { type: 'text', value: ' ' },
      { type: 'text', value: 'bad id' },
    ])
  })
})

describe('internalPageOf', () => {
  it('reads the page id of an in-screen link only', () => {
    expect(internalPageOf('/brain?page=notes%2Fa')).toBe('notes/a')
    expect(internalPageOf('/brain?page=..%2Fx')).toBeNull()
    expect(
      internalPageOf('https://example.com/brain?page=notes%2Fa'),
    ).toBeNull()
    expect(internalPageOf(undefined)).toBeNull()
    expect(internalPageOf('/brain?page=%')).toBeNull()
    expect(internalPageOf('/brain?page=%E0%A4%A')).toBeNull()
  })
})
