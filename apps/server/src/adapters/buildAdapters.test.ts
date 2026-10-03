import { orbitConfigSchema } from '../config/orbitConfigSchema'
import { buildAdapters } from './buildAdapters'

const context = (raw: unknown) => ({
  config: orbitConfigSchema.parse(raw),
  stateDir: '/tmp/orbit',
  uid: 501,
  record: () => undefined,
  run: async () => await Promise.resolve({ code: 0, stdout: '' }),
  fetch,
})

const worker = { url: 'http://127.0.0.1:8765', tokenFile: '/t' }
const ids = (raw: unknown) => buildAdapters(context(raw)).map((a) => a.id)

describe('buildAdapters', () => {
  it('builds only configured components', () => {
    expect(buildAdapters(context({})).map((a) => a.id)).toEqual([])
    const all = buildAdapters(
      context({
        synthetic: true,
        worker,
        launchd: {
          labels: [
            {
              component: 'worker',
              label: 'com.example.w',
              role: 'keepalive',
              plist: '/p',
            },
          ],
        },
        cadenceMs: { worker: 7000 },
      }),
    )
    expect(all.map((a) => [a.id, a.cadenceMs])).toEqual([
      ['launchd', 10_000],
      ['worker', 7000],
      ['synthetic', 1000],
    ])
  })
  it('skips launchd without labels and synthetic when false', () => {
    expect(ids({ launchd: { labels: [] }, synthetic: false })).toEqual([])
    expect(ids({ worker })).toEqual(['worker'])
    expect(ids({ synthetic: true })).toEqual(['synthetic'])
  })
  it('defaults the worker cadence to 5 s and overrides launchd', () => {
    const [w] = buildAdapters(context({ worker }))
    expect(w?.cadenceMs).toBe(5000)
    const [l] = buildAdapters(
      context({
        launchd: {
          labels: [
            {
              component: 'worker',
              label: 'com.example.w',
              role: 'scheduled',
              plist: '/p',
            },
          ],
        },
        cadenceMs: { launchd: 3000 },
      }),
    )
    expect(l?.cadenceMs).toBe(3000)
  })
  it('honours a synthetic cadence', () => {
    const [s] = buildAdapters(
      context({ synthetic: true, cadenceMs: { synthetic: 2000 } }),
    )
    expect([s?.cadenceMs, s?.timeoutMs, s?.freshnessMs]).toEqual([
      2000, 4000, 10_000,
    ])
  })
})
