import { argMatches } from './argMatches'

describe('argMatches', () => {
  it('fills {jobKey} only with a 32-hex registry key', () => {
    expect(argMatches('{jobKey}', 'a'.repeat(32))).toBe(true)
    for (const bad of ['A'.repeat(32), 'a'.repeat(31), '../x', '--json'])
      expect(argMatches('{jobKey}', bad)).toBe(false)
  })
  it('keeps literal arguments exact', () => {
    expect(argMatches('--json', '--json')).toBe(true)
    expect(argMatches('--json', '--jsonx')).toBe(false)
  })
})
