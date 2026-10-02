import { openTestState } from '../../test/openTestState'
import { writeFakeBin } from '../../test/writeFakeBin'
import { checkLaunchdLoaded } from './checkLaunchdLoaded'

const entry = (label: string) => ({
  component: 'worker',
  label,
  role: 'scheduled',
  plist: '/x.plist',
})
const uid = String(process.getuid?.() ?? 0)
// Succeeds only for `print gui/<uid>/com.example.loaded`, and only when the
// environment carries none of the parent's variables.
const launchctl = `[ -n "$ORBIT_PROBE_SECRET" ] && exit 9
[ "$1" = print ] && [ "$2" = "gui/${uid}/com.example.loaded" ]`

describe('checkLaunchdLoaded', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('passes when nothing is registered', async () => {
    const state = await openTestState()
    expect((await checkLaunchdLoaded(state)).level).toBe('ok')
    state.close()
  })

  it('names the labels launchd does not know, and passes the loaded ones', async () => {
    vi.stubEnv('ORBIT_PROBE_SECRET', 'leak')
    const state = await openTestState({
      launchd: {
        launchctl: await writeFakeBin('launchctl', launchctl),
        labels: [entry('com.example.loaded'), entry('com.example.gone')],
      },
    })
    expect(await checkLaunchdLoaded(state)).toMatchObject({
      level: 'fail',
      detail: 'not loaded: com.example.gone',
    })
    state.close()
  })

  it('passes when every label is loaded', async () => {
    const state = await openTestState({
      launchd: {
        launchctl: await writeFakeBin('launchctl', launchctl),
        labels: [entry('com.example.loaded')],
      },
    })
    expect(await checkLaunchdLoaded(state)).toMatchObject({
      level: 'ok',
      detail: '1 loaded',
    })
    state.close()
  })

  it('treats a missing launchctl as not loaded', async () => {
    const state = await openTestState({
      launchd: {
        launchctl: '/nonexistent/launchctl',
        labels: [entry('com.example.loaded')],
      },
    })
    expect((await checkLaunchdLoaded(state)).level).toBe('fail')
    state.close()
  })
})
