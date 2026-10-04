import { createClipsAdapter } from './createClipsAdapter'

describe('createClipsAdapter', () => {
  it('accepts a status document printed with exit 2', async () => {
    const adapter = createClipsAdapter({
      cadenceMs: 60_000,
      run: async (args) =>
        await Promise.resolve(
          args[0] === 'status'
            ? {
                code: 2,
                stdout:
                  '{"schemaVersion":1,"total":1,"states":{"inconsistent":1},"oldestAt":{},"intake":{"days":[],"undated":0}}',
              }
            : { code: 0, stdout: '{"schemaVersion":1,"ok":true,"checks":[]}' },
        ),
    })
    const core = await adapter.read(new AbortController().signal)
    expect(core.component).toBe('clips')
    expect(core.health).toEqual({ state: 'warn', reason: 'check_failed' })
  })
  it('warns backlog when the oldest waiting clip passes the limit', async () => {
    const adapter = createClipsAdapter({
      cadenceMs: 60_000,
      oldestDays: 1,
      run: async (args) =>
        await Promise.resolve(
          args[0] === 'status'
            ? {
                code: 0,
                stdout:
                  '{"schemaVersion":1,"total":1,"states":{"pending":1},"oldestAt":{"pending":"2020-01-01T00:00:00Z"},"intake":{"days":[],"undated":0}}',
              }
            : { code: 0, stdout: '{"schemaVersion":1,"ok":true,"checks":[]}' },
        ),
    })
    const core = await adapter.read(new AbortController().signal)
    expect(core.health).toEqual({ state: 'warn', reason: 'backlog' })
  })
})
