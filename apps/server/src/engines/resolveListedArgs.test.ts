import { resolveListedArgs } from './resolveListedArgs'

const table = [
  ['lint', '--json'],
  ['doctor', '--json', '--skip', 'credentials'],
  ['graph', '--json', '--no-html'],
  ['graph', '--json', '--related', '--limit', '50'],
  ['page', '--json', '--id', '{pageId}'],
  ['context', '--json', '--', '{query}'],
]

describe('resolveListedArgs', () => {
  it('runs an exact entry as requested', () => {
    expect(resolveListedArgs(table, ['lint', '--json'])).toEqual([
      'lint',
      '--json',
    ])
  })
  it('completes a unique leading match from the table', () => {
    expect(resolveListedArgs(table, ['doctor', '--json'])).toEqual([
      'doctor',
      '--json',
      '--skip',
      'credentials',
    ])
    expect(resolveListedArgs(table, ['graph', '--json', '--related'])).toEqual([
      'graph',
      '--json',
      '--related',
      '--limit',
      '50',
    ])
  })
  it('refuses an ambiguous, unknown or longer request', () => {
    expect(resolveListedArgs(table, ['graph', '--json'])).toBeNull()
    expect(resolveListedArgs(table, ['index'])).toBeNull()
    expect(resolveListedArgs(table, ['lint', '--json', '--fix'])).toBeNull()
  })
  it('fills the placeholder only with a valid page id', () => {
    expect(
      resolveListedArgs(table, ['page', '--json', '--id', 'notes/a']),
    ).toEqual(['page', '--json', '--id', 'notes/a'])
    for (const id of ['../etc/passwd', '--json', 'notes/a b', '{pageId}'])
      expect(
        resolveListedArgs(table, ['page', '--json', '--id', id]),
      ).toBeNull()
  })
  it('fills the query placeholder only with a trimmed bounded query', () => {
    const ask = (query: string) =>
      resolveListedArgs(table, ['context', '--json', '--', query])
    expect(ask('what changed --help')).toEqual([
      'context',
      '--json',
      '--',
      'what changed --help',
    ])
    for (const query of ['', ' padded ', 'a\nb', 'x'.repeat(501)])
      expect(ask(query)).toBeNull()
  })
  it('never completes a request into an unfilled placeholder', () => {
    expect(resolveListedArgs(table, ['page', '--json'])).toBeNull()
    expect(resolveListedArgs(table, ['context', '--json', '--'])).toBeNull()
  })
  it('prefers an exact entry over longer leading matches', () => {
    expect(
      resolveListedArgs(
        [
          ['lint', '--json'],
          ['lint', '--json', '--strict'],
        ],
        ['lint', '--json'],
      ),
    ).toEqual(['lint', '--json'])
  })
  it('retains a filled placeholder when completing a literal tail', () => {
    expect(
      resolveListedArgs(
        [['page', '--id', '{pageId}', '--json']],
        ['page', '--id', 'notes/a'],
      ),
    ).toEqual(['page', '--id', 'notes/a', '--json'])
  })
})
