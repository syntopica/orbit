import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { openTestState } from '../../test/openTestState'
import { writeFakeBin } from '../../test/writeFakeBin'
import { checkOrbitPlist } from './checkOrbitPlist'

const levelFor = async (plutil: string) => {
  vi.stubEnv('HOME', await mkdtemp(join(tmpdir(), 'orbit-home-')))
  const state = await openTestState({ launchd: { plutil } })
  const result = await checkOrbitPlist(state)
  state.close()
  return result
}

const printing = async (json: string) =>
  writeFakeBin(
    'plutil',
    `case "$5" in */Library/LaunchAgents/com.syntopica.orbit.plist) ;; *) exit 1;; esac
echo '${json}'`,
  )

describe('checkOrbitPlist', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('passes when the plist carries Umask 63', async () => {
    expect(await levelFor(await printing('{"Umask":63}'))).toMatchObject({
      level: 'ok',
    })
  })

  it('fails when the Umask differs or is absent', async () => {
    expect((await levelFor(await printing('{"Umask":18}'))).level).toBe('fail')
    expect((await levelFor(await printing('{}'))).level).toBe('fail')
    expect((await levelFor(await printing('[]'))).level).toBe('fail')
    expect((await levelFor(await printing('nope'))).level).toBe('fail')
  })

  it('warns when the plist is not installed or plutil is missing', async () => {
    expect((await levelFor(await writeFakeBin('plutil', 'exit 1'))).level).toBe(
      'warn',
    )
    expect((await levelFor('/nonexistent/plutil')).level).toBe('warn')
  })
})
