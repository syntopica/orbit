import type { EngineRunner } from '../types/EngineRunner'
import { buildBrainReaders } from './buildBrainReaders'

const signal = new AbortController().signal
const graph = {
  schemaVersion: 1,
  nodes: [],
  edges: [],
  orphans: [],
  dangling: [],
}

describe('buildBrainReaders', () => {
  it('is null when brain is not configured', () => {
    expect(buildBrainReaders(undefined, false, 60_000)).toBeNull()
  })
  it('reads not_found when configured but unresolved', async () => {
    const readers = buildBrainReaders(undefined, true, 60_000)
    await expect(readers?.graph(signal)).rejects.toMatchObject({
      reason: 'not_found',
    })
  })
  it('serves the graph from cache within the cadence', async () => {
    const run = vi.fn<EngineRunner>(async () =>
      Promise.resolve({ code: 0, stdout: JSON.stringify(graph) }),
    )
    const readers = buildBrainReaders(run, true, 60_000, () => 0)
    await readers?.graph(signal)
    await readers?.graph(signal)
    expect(run).toHaveBeenCalledTimes(1)
  })
})
