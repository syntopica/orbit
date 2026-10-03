import { buildLaunchdPath } from './buildLaunchdPath'

describe('buildLaunchdPath', () => {
  it('puts the node directory first, then the shell PATH without duplicates', () => {
    expect(
      buildLaunchdPath('/opt/n/bin/node', '/usr/bin:/opt/n/bin:/usr/bin:/x'),
    ).toBe('/opt/n/bin:/usr/bin:/x')
  })

  it('falls back to the system directories when PATH is unset or empty', () => {
    expect(buildLaunchdPath('/opt/n/bin/node', undefined)).toBe(
      '/opt/n/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    )
    expect(buildLaunchdPath('/opt/n/bin/node', '')).toBe(
      '/opt/n/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    )
  })
})
