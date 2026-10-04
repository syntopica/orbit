import { orbitConfigSchema } from '../../config/orbitConfigSchema'
import { buildTestApp } from '../../test/buildTestApp'
import type { RunRequest } from '../../types/RunRequest'
import type { RunResult } from '../../types/RunResult'

describe('action routes', () => {
  const config = orbitConfigSchema.parse({
    launchd: {
      launchctl: '/fake/launchctl',
      labels: [
        {
          component: 'launchd',
          label: 'com.example.nightly',
          role: 'scheduled',
          plist: '/fake.plist',
          actions: ['run'],
        },
        {
          component: 'worker',
          label: 'com.example.service',
          role: 'keepalive',
          plist: '/fake.plist',
          actions: ['restart'],
        },
        {
          component: 'launchd',
          label: 'com.syntopica.orbit',
          role: 'keepalive',
          plist: '/fake.plist',
          actions: ['restart'],
        },
      ],
    },
    engines: {
      brain: {
        command: '/fake/brain',
        subcommands: [['status']],
        actions: {
          rebuild: {
            args: ['graph', 'rebuild'],
            label: 'Rebuild graph',
            timeoutS: 30,
          },
        },
      },
    },
  })
  it('returns a run immediately, enforces single flight and emits metadata only', async () => {
    let finish: (result: RunResult) => void = () => undefined
    const run = vi.fn(
      async (_request: RunRequest) =>
        await new Promise<RunResult>((resolve) => {
          finish = resolve
        }),
    )
    const app = buildTestApp({
      actions: {
        launchd: config.launchd,
        engines: config.engines,
        runners: {},
        run,
        uid: 501,
        env: {},
      },
    })
    const path = '/api/launchd/com.example.nightly/run'
    const first = await app.post(path, '', { Cookie: app.cookie })
    expect(first.status).toBe(202)
    expect(await first.json()).toMatchObject({ state: 'started' })
    const second = await app.post(path, '', { Cookie: app.cookie })
    expect(second.status).toBe(409)
    expect(await second.json()).toMatchObject({
      error: 'already_running',
      startedAt: 1_790_000_000_000,
    })
    expect(run.mock.calls).toHaveLength(1)
    expect(run.mock.calls[0]?.[0]).toMatchObject({
      file: '/fake/launchctl',
      args: ['kickstart', 'gui/501/com.example.nightly'],
    })
    finish({ code: 1, stdout: 'PRIVATE OUTPUT' })
    await vi.waitFor(async () => {
      expect(
        (
          (await (await app.get('/api/actions')).json()) as {
            runs: { state: string }[]
          }
        ).runs[0]?.state,
      ).toBe('failed')
    })
    const events = app.deps.hub.recentEvents()
    expect(events.map((item) => item.event.kind)).toEqual([
      'action.started',
      'action.failed',
    ])
    expect(events[1]?.event.refs).toMatchObject({
      kind: 'run',
      target: 'com.example.nightly',
      exitCode: 1,
    })
    expect(JSON.stringify(events)).not.toContain('PRIVATE')
  })
  it('refuses unknown, mismatched and self actions', async () => {
    const app = buildTestApp({
      actions: {
        launchd: config.launchd,
        engines: config.engines,
        runners: {},
        run: vi.fn(),
        uid: 501,
        env: {},
      },
    })
    expect(
      (
        await app.post('/api/launchd/com.example.nightly/restart', '', {
          Cookie: app.cookie,
        })
      ).status,
    ).toBe(404)
    expect(
      (
        await app.post('/api/launchd/com.example.unknown/run', '', {
          Cookie: app.cookie,
        })
      ).status,
    ).toBe(404)
    const self = await app.post(
      '/api/launchd/com.syntopica.orbit/restart',
      '',
      { Cookie: app.cookie },
    )
    expect(self.status).toBe(400)
    expect(await self.json()).toEqual({ error: 'self' })
    expect(
      (
        await app.post('/api/engines/brain/actions/missing', '', {
          Cookie: app.cookie,
        })
      ).status,
    ).toBe(404)
  })
  it('limits requests per session and requires CSRF', async () => {
    const app = buildTestApp({
      actions: {
        launchd: config.launchd,
        engines: config.engines,
        runners: {},
        run: vi.fn(),
        uid: 501,
        env: {},
      },
    })
    const path = '/api/launchd/unknown/run'
    for (let index = 0; index < 10; index += 1)
      expect((await app.post(path, '', { Cookie: app.cookie })).status).toBe(
        404,
      )
    const limited = await app.post(path, '', { Cookie: app.cookie })
    expect(limited.status).toBe(429)
    expect(await limited.json()).toEqual({ error: 'rate_limited' })
    const csrf = await app.app.request(`http://127.0.0.1:8790${path}`, {
      method: 'POST',
      headers: {
        Host: '127.0.0.1:8790',
        Origin: 'http://127.0.0.1:8790',
        Cookie: app.cookie,
      },
    })
    expect(csrf.status).toBe(403)
  })
  it('runs a fixed engine action with its configured timeout', async () => {
    const runner = vi.fn(
      async () => await Promise.resolve({ code: 0, stdout: 'SECRET' }),
    )
    const app = buildTestApp({
      actions: {
        launchd: config.launchd,
        engines: config.engines,
        runners: { brain: runner },
        run: vi.fn(),
        uid: 501,
        env: {},
      },
    })
    await app.post('/api/engines/brain/actions/rebuild', '', {
      Cookie: app.cookie,
    })
    expect(runner).toHaveBeenCalledWith(
      ['graph', 'rebuild'],
      expect.any(AbortSignal),
      30_000,
    )
    const listed = (await (await app.get('/api/actions')).json()) as {
      runs: { state: string }[]
    }
    expect(listed.runs[0]?.state).toBe('succeeded')
    expect(JSON.stringify(app.deps.hub.recentEvents())).not.toContain('SECRET')
  })
})
