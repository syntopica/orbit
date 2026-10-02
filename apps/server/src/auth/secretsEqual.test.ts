import { secretsEqual } from './secretsEqual'

describe('secretsEqual', () => {
  it('compares equal-length hex values', () => {
    expect(secretsEqual('abcd', 'abcd')).toBe(true)
    expect(secretsEqual('abcd', 'abce')).toBe(false)
  })
  it('returns false without throwing on unequal lengths', () => {
    expect(secretsEqual('abcd', 'abcdef')).toBe(false)
    expect(secretsEqual('', 'ab')).toBe(false)
  })
  it('rejects odd-length, non-hex and empty inputs that Buffer would truncate', () => {
    expect(secretsEqual('abc', 'abd')).toBe(false)
    expect(secretsEqual('zz', 'yy')).toBe(false)
    expect(secretsEqual('', '')).toBe(false)
    expect(secretsEqual('ab', 'abzz')).toBe(false)
  })
})
