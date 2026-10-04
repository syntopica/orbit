import { describe, expect, it } from 'vitest'

import { parseInlineMarkdown } from './parseInlineMarkdown'

describe('parseInlineMarkdown', () => {
  it('drops emphasis markers and keeps backtick spans as code', () => {
    expect(
      parseInlineMarkdown('**Run** `tool --flag` on __the__ example'),
    ).toEqual([
      { at: 0, code: false, text: 'Run ' },
      { at: 8, code: true, text: 'tool --flag' },
      { at: 21, code: false, text: ' on the example' },
    ])
  })

  it('leaves markup as text and an unmatched backtick alone', () => {
    expect(parseInlineMarkdown('<b>x</b> `open')).toEqual([
      { at: 0, code: false, text: '<b>x</b> `open' },
    ])
    expect(parseInlineMarkdown('``')).toEqual([
      { at: 0, code: false, text: '``' },
    ])
  })
})
