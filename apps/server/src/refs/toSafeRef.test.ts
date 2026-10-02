import { toSafeRef } from './toSafeRef'

describe('toSafeRef', () => {
  it('keeps opaque ids and drops anything else', () => {
    expect(toSafeRef('job-01HZX.a:b')).toBe('job-01HZX.a:b')
    expect(toSafeRef('has space')).toBeUndefined()
    expect(toSafeRef('a/b')).toBeUndefined()
    expect(toSafeRef('x'.repeat(65))).toBeUndefined()
    expect(toSafeRef(null)).toBeUndefined()
  })
  it('pins the length bound and the empty value', () => {
    expect(toSafeRef('x'.repeat(64))).toBe('x'.repeat(64))
    expect(toSafeRef('')).toBeUndefined()
  })
  it('anchors the pattern at both ends', () => {
    expect(toSafeRef('ok\nbad value')).toBeUndefined()
    expect(toSafeRef('ok/')).toBeUndefined()
    expect(toSafeRef('/ok')).toBeUndefined()
  })
})
