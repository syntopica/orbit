import { resolveDataDir } from './resolveDataDir'

describe('resolveDataDir', () => {
  it('returns an absolute SYNTOPICA_DATA', () => {
    expect(resolveDataDir({ SYNTOPICA_DATA: '/srv/instance' })).toBe(
      '/srv/instance',
    )
  })
  it('rejects a missing or relative value', () => {
    expect(() => resolveDataDir({})).toThrow('SYNTOPICA_DATA')
    expect(() => resolveDataDir({ SYNTOPICA_DATA: 'relative' })).toThrow(
      'SYNTOPICA_DATA',
    )
  })
})
