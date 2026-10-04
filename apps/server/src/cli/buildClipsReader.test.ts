import { createLatestClipsDocuments } from '../adapters/clips/createLatestClipsDocuments'
import type { EngineRunner } from '../types/EngineRunner'
import { buildClipsReader } from './buildClipsReader'

describe('buildClipsReader', () => {
  it('shares engine reads and expires at the configured cadence', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(0)
    const run = vi.fn<EngineRunner>().mockImplementation(
      async (args) =>
        await Promise.resolve({
          code: 0,
          stdout: JSON.stringify(
            args[0] === 'status'
              ? {
                  schemaVersion: 1,
                  total: 0,
                  states: {},
                  oldestAt: {},
                  intake: { days: [], undated: 0 },
                }
              : { schemaVersion: 1, ok: true, checks: [] },
          ),
        }),
    )
    try {
      const read = buildClipsReader(run, true, 1000)
      const signal = new AbortController().signal
      await Promise.all([read?.(signal), read?.(signal)])
      expect(run.mock.calls.map(([args]) => args)).toEqual([
        ['status', '--json'],
        ['doctor', '--json'],
      ])
      vi.mocked(Date.now).mockReturnValue(999)
      await read?.(signal)
      expect(run).toHaveBeenCalledTimes(2)
      vi.mocked(Date.now).mockReturnValue(1000)
      await read?.(signal)
      expect(run).toHaveBeenCalledTimes(4)
    } finally {
      vi.restoreAllMocks()
    }
  })
  it("serves the adapter's fresh read without running the engine, and feeds it", async () => {
    const run = vi.fn<EngineRunner>().mockRejectedValue(new Error('ran'))
    let now = 0
    const latest = createLatestClipsDocuments(() => now)
    const documents = {
      status: {
        schemaVersion: 1 as const,
        total: 0,
        states: {},
        oldestAt: {},
        intake: { days: [], undated: 0 },
      },
      doctor: { schemaVersion: 1 as const, ok: true, checks: [] },
    }
    latest.put(documents)
    const read = buildClipsReader(run, true, 1000, latest)
    now = 2000
    expect(await read?.(new AbortController().signal)).toBe(documents)
    expect(run).not.toHaveBeenCalled()
    now = 2001
    await expect(read?.(new AbortController().signal)).rejects.toThrow('ran')
  })
  it('omits unconfigured engines and fails when configured but unresolved', async () => {
    expect(buildClipsReader(undefined, false, 1000)).toBeNull()
    const read = buildClipsReader(undefined, true, 1000)
    await expect(read?.(new AbortController().signal)).rejects.toThrow(
      'not_found',
    )
  })
})
