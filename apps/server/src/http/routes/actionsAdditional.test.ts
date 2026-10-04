import { orbitConfigSchema } from '../../config/orbitConfigSchema'
import { buildSteppedApp } from '../../test/buildSteppedApp'
import type { RunRequest } from '../../types/RunRequest'
import { getConfiguredEngineAction } from './getConfiguredEngineAction'

describe('configured actions', () => {
  const config = orbitConfigSchema.parse({
    launchd: {
      launchctl: '/fake/launchctl',
      labels: [
        {
          component: 'worker',
          label: 'com.example.service',
          role: 'keepalive',
          plist: '/fake.plist',
          actions: ['restart'],
        },
        {
          component: 'launchd',
          label: 'com.example.passive',
          role: 'scheduled',
          plist: '/fake.plist',
        },
      ],
    },
    engines: {
      clips: {
        command: '/fake/clips',
        subcommands: [['status']],
        actions: { refresh: { args: ['refresh'], label: 'Refresh' } },
      },
    },
  })
  it('offers only configured engine actions and refuses missing runners', async () => {
    const app = buildSteppedApp({
      actions: {
        launchd: config.launchd,
        engines: config.engines,
        runners: {},
        run: vi.fn(),
        uid: 501,
        env: {},
      },
    })
    const listed = await app.get('/api/engines/clips/actions')
    expect(listed.status).toBe(200)
    expect(await listed.json()).toMatchObject({
      actions: { refresh: { args: ['refresh'] } },
    })
    expect((await app.get('/api/engines/brain/actions')).status).toBe(404)
    expect(
      (
        await app.post('/api/engines/clips/actions/refresh', '', {
          Cookie: app.cookie,
        })
      ).status,
    ).toBe(404)
    expect(
      (
        await app.post('/api/launchd/com.example.passive/run', '', {
          Cookie: app.cookie,
        })
      ).status,
    ).toBe(404)
  })
  it('restarts a configured service with -k and no output in the response', async () => {
    const run = vi.fn(
      async (_request: RunRequest) =>
        await Promise.resolve({ code: 0, stdout: 'PRIVATE' }),
    )
    const app = buildSteppedApp({
      actions: {
        launchd: config.launchd,
        engines: config.engines,
        runners: {},
        run,
        uid: 501,
        env: {},
      },
    })
    const response = await app.post(
      '/api/launchd/com.example.service/restart',
      '',
      { Cookie: app.cookie },
    )
    expect(response.status).toBe(202)
    expect(await response.text()).not.toContain('PRIVATE')
    expect(run.mock.calls[0]?.[0]).toMatchObject({
      args: ['kickstart', '-k', 'gui/501/com.example.service'],
    })
    await vi.waitFor(async () => {
      const listed = (await (await app.get('/api/actions')).json()) as {
        runs: { state: string }[]
      }
      expect(listed.runs[0]?.state).toBe('succeeded')
    })
  })
  it('resolves only known engine action and runner pairs', () => {
    const deps = {
      launchd: config.launchd,
      engines: config.engines,
      runners: {
        clips: async () => await Promise.resolve({ code: 0, stdout: '' }),
      },
      run: vi.fn(),
      uid: 501,
      env: {},
    }
    expect(getConfiguredEngineAction(undefined, 'clips', 'refresh')).toBeNull()
    expect(getConfiguredEngineAction(deps, 'unknown', 'refresh')).toBeNull()
    expect(getConfiguredEngineAction(deps, 'clips', 'missing')).toBeNull()
    expect(
      getConfiguredEngineAction({ ...deps, runners: {} }, 'clips', 'refresh'),
    ).toBeNull()
    expect(getConfiguredEngineAction(deps, 'clips', 'refresh')).toMatchObject({
      name: 'clips',
    })
  })
  it('aborts an active action when the server stops', async () => {
    const controller = new AbortController()
    let childSignal: AbortSignal | undefined
    const run = async (request: RunRequest) =>
      await new Promise<{ code: number; stdout: string }>(
        (_resolve, reject) => {
          childSignal = request.signal
          request.signal?.addEventListener('abort', () => {
            reject(new Error('stopped'))
          })
        },
      )
    const app = buildSteppedApp({
      actionSignal: controller.signal,
      actions: {
        launchd: config.launchd,
        engines: config.engines,
        runners: {},
        run,
        uid: 501,
        env: {},
      },
    })
    expect(
      (
        await app.post('/api/launchd/com.example.service/restart', '', {
          Cookie: app.cookie,
        })
      ).status,
    ).toBe(202)
    controller.abort()
    expect(childSignal?.aborted).toBe(true)
    await vi.waitFor(async () => {
      const listed = (await (await app.get('/api/actions')).json()) as {
        runs: { state: string }[]
      }
      expect(listed.runs[0]?.state).toBe('failed')
    })
  })
})
