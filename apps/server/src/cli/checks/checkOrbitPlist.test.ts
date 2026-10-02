import { mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { openTestState } from '../../test/openTestState'
import { writeFakeBin } from '../../test/writeFakeBin'
import { checkOrbitPlist } from './checkOrbitPlist'

const levelFor = async (makePlutil: (home: string) => Promise<string>) => {
  const home = await mkdtemp(join(tmpdir(), 'orbit-home-'))
  const plutil = await makePlutil(home)
  const state = await openTestState({ launchd: { plutil } }, { HOME: home })
  const result = await checkOrbitPlist(state)
  state.close()
  return result
}

// Answers only for the plist under the HOME the check was given.
const printing = (json: string) => async (home: string) =>
  writeFakeBin(
    'plutil',
    `[ "$5" = '${home}/Library/LaunchAgents/com.syntopica.orbit.plist' ] || exit 1
echo '${json}'`,
  )

describe('checkOrbitPlist', () => {
  it('passes when the plist carries Umask 63', async () => {
    expect(await levelFor(printing('{"Umask":63}'))).toMatchObject({
      level: 'ok',
    })
  })

  it('fails when the Umask differs or is absent', async () => {
    expect((await levelFor(printing('{"Umask":18}'))).level).toBe('fail')
    expect((await levelFor(printing('{}'))).level).toBe('fail')
    expect((await levelFor(printing('[]'))).level).toBe('fail')
    expect((await levelFor(printing('nope'))).level).toBe('fail')
  })

  it('warns when the plist is not installed or plutil is missing', async () => {
    expect(
      await levelFor(async () => writeFakeBin('plutil', 'exit 1')),
    ).toMatchObject({ level: 'warn', detail: 'LaunchAgent not installed' })
    expect(
      await levelFor(async (home) => {
        await mkdir(home, { recursive: true })
        return join(home, 'no-plutil')
      }),
    ).toMatchObject({
      level: 'warn',
      detail: 'plutil unavailable',
    })
  })
})
