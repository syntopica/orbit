import { resolveListedArgs } from './resolveListedArgs'

const table = [
  ['lint', '--json'],
  ['doctor', '--json', '--skip', 'credentials'],
  ['graph', '--json', '--no-html'],
  ['graph', '--json', '--related', '--limit', '50'],
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
})
