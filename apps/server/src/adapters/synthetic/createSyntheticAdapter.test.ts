import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createSyntheticAdapter } from './createSyntheticAdapter'

const flagPath = async () =>
  join(await mkdtemp(join(tmpdir(), 'orbit-synthetic-')), 'synthetic-fail')

describe('createSyntheticAdapter', () => {
  it('fails while the flag file exists', async () => {
    const flag = await flagPath()
    const adapter = createSyntheticAdapter(flag)
    const signal = new AbortController().signal
    const core = await adapter.read(signal)
    expect(core.events.map((e) => e.kind)).toEqual(['synthetic.tick'])
    await writeFile(flag, '')
    await expect(adapter.read(signal)).rejects.toMatchObject({
      reason: 'unreachable',
    })
    await rm(flag)
    await expect(adapter.read(signal)).resolves.toMatchObject({
      component: 'synthetic',
    })
  })
  it('declares its timings and counts ticks', async () => {
    const adapter = createSyntheticAdapter(await flagPath())
    expect([
      adapter.id,
      adapter.cadenceMs,
      adapter.timeoutMs,
      adapter.freshnessMs,
    ]).toEqual(['synthetic', 1000, 2000, 5000])
    const signal = new AbortController().signal
    const first = await adapter.read(signal)
    const second = await adapter.read(signal)
    expect(first.events[0]?.refs).toEqual({ n: 1 })
    expect(second.events[0]?.refs).toEqual({ n: 2 })
    expect(second.metrics).toMatchObject([{ key: 'synthetic.value', value: 2 }])
    expect(second.pending).toEqual([
      { key: 'synthetic.items', count: 2, oldestAt: null },
    ])
    expect(second.health).toEqual({ state: 'ok', reason: null })
  })
})
