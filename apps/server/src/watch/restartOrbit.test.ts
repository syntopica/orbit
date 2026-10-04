import { restartOrbit } from './restartOrbit'

describe('restartOrbit', () => {
  it('reports whether launchctl succeeded', async () => {
    expect(await restartOrbit('/usr/bin/true', {})).toBe(true)
    expect(await restartOrbit('/usr/bin/false', {})).toBe(false)
  })
  it('reports a launchctl that cannot run as a failure', async () => {
    expect(await restartOrbit('/nonexistent/launchctl', {})).toBe(false)
  })
})
