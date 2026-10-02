import { openTestState } from '../../test/openTestState'
import { writeFakeBin } from '../../test/writeFakeBin'
import { checkTailscaleServe } from './checkTailscaleServe'

const HOST = 'orbit.example.ts.net'
const web = (path: string, port: number, funnel = false): string =>
  JSON.stringify({
    Web: {
      [`${HOST}:443`]: {
        Handlers: { [path]: { Proxy: `http://127.0.0.1:${String(port)}` } },
      },
    },
    AllowFunnel: { [`${HOST}:443`]: funnel },
  })

// Puts a fake `tailscale` first on PATH that prints the given status, and
// fails when the parent's variables leak into its environment.
const fakeTailscale = async (stdout: string, code = 0): Promise<void> => {
  const bin = await writeFakeBin(
    'tailscale',
    `[ -n "$ORBIT_PROBE_SECRET" ] && exit 9
cat <<'JSON'
${stdout}
JSON
exit ${String(code)}`,
  )
  vi.stubEnv(
    'PATH',
    `${bin.replace(/\/tailscale$/, '')}:${process.env['PATH'] ?? ''}`,
  )
  vi.stubEnv('ORBIT_PROBE_SECRET', 'leak')
}

const check = async (allowedHosts: string[]) => {
  const state = await openTestState({ allowedHosts, port: 8790 })
  const result = await checkTailscaleServe(state)
  state.close()
  return result
}

describe('checkTailscaleServe', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('passes without running tailscale when nothing is published', async () => {
    expect((await check([])).detail).toContain('not published')
  })

  it('passes when the root handler proxies to the port and the name is allowed', async () => {
    await fakeTailscale(web('/', 8790))
    expect(await check([HOST])).toMatchObject({
      level: 'ok',
      detail: `published as ${HOST}`,
    })
  })

  it('fails when Funnel exposes the served name', async () => {
    await fakeTailscale(web('/', 8790, true))
    expect(await check([HOST])).toMatchObject({ level: 'fail' })
    expect((await check([HOST])).detail).toContain('Funnel')
  })

  it('fails when only another path proxies to the port', async () => {
    await fakeTailscale(web('/other', 8790))
    expect((await check([HOST])).detail).toContain('no root handler')
  })

  it('fails when the published name is not allowed', async () => {
    await fakeTailscale(web('/', 8790))
    expect(await check(['other.example.ts.net'])).toMatchObject({
      level: 'fail',
      detail: `published name not in allowedHosts: ${HOST}`,
    })
  })

  it('warns when the tailscale CLI fails', async () => {
    await fakeTailscale('', 1)
    expect((await check([HOST])).level).toBe('warn')
  })

  it('warns when the tailscale CLI is absent', async () => {
    vi.stubEnv('PATH', '/nonexistent')
    expect((await check([HOST])).level).toBe('warn')
  })
})
