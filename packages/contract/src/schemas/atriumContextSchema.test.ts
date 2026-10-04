import { atriumContextSchema } from './atriumContextSchema'

const block = {
  rank: 1,
  trust: 'curated',
  role: 'note',
  provider: 'brain',
  notePath: 'notes/a.md',
  conversationId: null,
  authoredAt: null,
  chars: 5,
  text: 'hello',
  truncated: false,
}
const context = {
  now: 1_790_000_000_000,
  blocks: [block],
  textChars: 5,
  limit: 8,
  maxChars: 16_000,
  warnings: ['lexical_budget_exhausted'],
  freshnessStatus: 'fresh',
}

describe('atriumContextSchema', () => {
  it('accepts labelled blocks with their sizes', () => {
    expect(atriumContextSchema.parse(context)).toEqual(context)
  })
  it('rejects an unknown trust and a warning that is free text', () => {
    const blocks = [{ ...block, trust: 'other' }]
    expect(() => atriumContextSchema.parse({ ...context, blocks })).toThrow()
    expect(() =>
      atriumContextSchema.parse({ ...context, warnings: ['two words'] }),
    ).toThrow()
  })
})
