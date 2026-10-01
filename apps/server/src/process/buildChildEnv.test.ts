import { buildChildEnv } from './buildChildEnv'

describe('buildChildEnv', () => {
  it('keeps only the allowlist plus declared extras', () => {
    const env = buildChildEnv(
      {
        PATH: '/bin',
        HOME: '/h',
        SECRET_TOKEN: 'x',
        SYNTOPICA_DATA: '/d',
        LANG: 'C',
      },
      { UV_CACHE_DIR: '/c' },
    )
    expect(env).toEqual({
      PATH: '/bin',
      HOME: '/h',
      SYNTOPICA_DATA: '/d',
      LANG: 'C',
      UV_CACHE_DIR: '/c',
    })
  })
  it('skips allowlisted names the source lacks', () => {
    expect(buildChildEnv({}, {})).toEqual({})
  })
})
