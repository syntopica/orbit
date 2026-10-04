import { contextQuerySchema } from './contextQuerySchema'

describe('contextQuerySchema', () => {
  it('trims and accepts 1 to 500 characters', () => {
    expect(contextQuerySchema.parse('  orbit doctor  ')).toBe('orbit doctor')
    expect(contextQuerySchema.parse('x'.repeat(500))).toHaveLength(500)
    expect(contextQuerySchema.parse(` ${'x'.repeat(500)} `)).toHaveLength(500)
  })
  it('refuses empty, blank and over-long queries', () => {
    for (const query of ['', '   ', 'x'.repeat(501)])
      expect(contextQuerySchema.safeParse(query).success).toBe(false)
  })
  it('refuses control characters anywhere inside the query', () => {
    for (const query of [
      'a\nb',
      'a\u0000b',
      'a\u001bb',
      'a\u007fb',
      'a\u0085b',
    ])
      expect(contextQuerySchema.safeParse(query).success).toBe(false)
  })
  it('keeps option-looking text as plain data', () => {
    expect(contextQuerySchema.parse('--project /x')).toBe('--project /x')
  })
})
