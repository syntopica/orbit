import { createLaunchdCatalog } from './createLaunchdCatalog'

const labels = [
  {
    component: 'atrium' as const,
    label: 'com.example.nightly',
    role: 'scheduled' as const,
    plist: '/a.plist',
  },
  {
    component: 'worker' as const,
    label: 'com.example.gone',
    role: 'keepalive' as const,
    plist: '/missing.plist',
  },
]
const make = (run: Parameters<typeof createLaunchdCatalog>[0]['run']) =>
  createLaunchdCatalog({
    launchctl: '/bin/launchctl',
    plutil: '/usr/bin/plutil',
    uid: 501,
    cadenceMs: 10_000,
    record: () => undefined,
    labels,
    run,
  })

describe('createLaunchdCatalog', () => {
  afterEach(() => vi.useRealTimers())

  it('caches each good schedule and tolerates a missing plist', async () => {
    let calls = 0
    const catalog = make(async (request) => {
      calls += 1
      return await Promise.resolve(
        request.args.at(-1) === '/a.plist'
          ? { code: 0, stdout: JSON.stringify({ StartInterval: 3600 }) }
          : { code: 1, stdout: '{"StartInterval":5}' },
      )
    })
    const signal = new AbortController().signal
    const rows = await catalog.rows(signal)
    await catalog.rows(signal)
    expect(calls).toBe(3)
    expect(rows.map((r) => r.schedule)).toEqual([
      { intervalS: 3600, calendar: false, keepAlive: false },
      null,
    ])
  })

  it('refreshes a schedule after ten minutes', async () => {
    vi.useFakeTimers()
    let calls = 0
    const catalog = make(async () => {
      calls += 1
      return await Promise.resolve({ code: 0, stdout: '{}' })
    })
    const signal = new AbortController().signal
    await catalog.rows(signal)
    vi.advanceTimersByTime(599_000)
    await catalog.rows(signal)
    expect(calls).toBe(2)
    vi.advanceTimersByTime(2_000)
    await catalog.rows(signal)
    expect(calls).toBe(4)
  })

  it('reads calendar and keepalive plists', async () => {
    const catalog = make(
      async () =>
        await Promise.resolve({
          code: 0,
          stdout: JSON.stringify({
            StartCalendarInterval: { Hour: 3 },
            KeepAlive: true,
          }),
        }),
    )
    const rows = await catalog.rows(new AbortController().signal)
    expect(rows[0]?.schedule).toEqual({
      intervalS: 86_400,
      calendar: true,
      keepAlive: true,
    })
  })

  it('throws when aborted before the next plist', async () => {
    const controller = new AbortController()
    const catalog = make(async () => {
      controller.abort()
      return await Promise.resolve({ code: 0, stdout: '{}' })
    })
    await expect(catalog.rows(controller.signal)).rejects.toThrow('timeout')
  })

  it('throws on a cached catalog once the signal is aborted', async () => {
    const catalog = make(
      async () => await Promise.resolve({ code: 0, stdout: '{}' }),
    )
    await catalog.rows(new AbortController().signal)
    const controller = new AbortController()
    controller.abort()
    await expect(catalog.rows(controller.signal)).rejects.toThrow('timeout')
  })

  it('does not cache a schedule whose read was aborted', async () => {
    const controller = new AbortController()
    let calls = 0
    const catalog = make(async () => {
      calls += 1
      controller.abort()
      return await Promise.reject(new Error('aborted'))
    })
    await expect(catalog.rows(controller.signal)).rejects.toThrow('timeout')
    await catalog.rows(new AbortController().signal).catch(() => undefined)
    expect(calls).toBe(3)
  })
  it('retries a failed plutil read on the next call', async () => {
    let calls = 0
    const catalog = make(async () => {
      calls += 1
      return await Promise.resolve(
        calls <= 2
          ? { code: 1, stdout: '' }
          : { code: 0, stdout: '{"StartInterval":60}' },
      )
    })
    const signal = new AbortController().signal
    expect((await catalog.rows(signal)).map((r) => r.schedule)).toEqual([
      null,
      null,
    ])
    expect((await catalog.rows(signal))[0]?.schedule?.intervalS).toBe(60)
  })

  it('ignores a non-positive StartInterval and a malformed calendar', async () => {
    const catalog = make(
      async () =>
        await Promise.resolve({
          code: 0,
          stdout: JSON.stringify({
            StartInterval: 0,
            StartCalendarInterval: 'x',
          }),
        }),
    )
    const rows = await catalog.rows(new AbortController().signal)
    expect(rows[0]?.schedule).toEqual({
      intervalS: null,
      calendar: false,
      keepAlive: false,
    })
  })
})
