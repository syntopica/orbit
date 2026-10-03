import { createBrainAdapter } from './createBrainAdapter'

const docs: Record<string, string> = {
  lint: '{"schemaVersion":1,"pageCount":4,"indexStale":false,"issues":[]}',
  doctor: '{"schemaVersion":1,"ok":true,"checks":[]}',
}

describe('createBrainAdapter', () => {
  it('runs lint then doctor and returns a brain snapshot', async () => {
    const calls: string[][] = []
    const adapter = createBrainAdapter({
      cadenceMs: 60_000,
      run: async (args) => {
        calls.push([...args])
        return await Promise.resolve({
          code: 0,
          stdout: docs[args[0] ?? ''] ?? '',
        })
      },
    })
    const core = await adapter.read(new AbortController().signal)
    expect(calls).toEqual([
      ['lint', '--json'],
      ['doctor', '--json'],
    ])
    expect(core.component).toBe('brain')
    expect(core.metrics[0]).toMatchObject({ key: 'brain.pages', value: 4 })
    expect([adapter.cadenceMs, adapter.freshnessMs]).toEqual([60_000, 120_000])
  })
})
