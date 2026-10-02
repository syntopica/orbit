import type { Snapshot } from '@orbit/contract'

import { createServerHub } from '../../hub/createServerHub'
import { buildTestApp } from '../../test/buildTestApp'
import { readSseBlocks } from '../../test/readSseBlocks'

const snap = (value: number): Snapshot => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: '2026-10-02T10:00:00.000Z' }],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
})

const START = 1_790_914_718_714
const types = (blocks: string[]) =>
  blocks.map((b) => /"type":"(\w+)"/.exec(b)?.[1])
const hasSync = (blocks: string[]) =>
  blocks.some((b) => b.includes('"type":"sync"'))

describe('stream resume with ids seeded as the server seeds them', () => {
  it('replays only the missed messages inside the ring, without resync', async () => {
    const hub = createServerHub(() => START)
    for (const value of [1, 2, 3]) hub.publish(snap(value))
    const { get } = buildTestApp({ hub })
    const res = await get('/api/stream', {
      'Last-Event-ID': String(START),
    })
    const blocks = await readSseBlocks(res, hasSync)
    expect(types(blocks)).toEqual(['snapshot', 'snapshot', 'sync'])
    expect(blocks.join('')).not.toContain('"value":1')
  })
  it('resyncs a Last-Event-ID from before a restart with the full set', async () => {
    const before = createServerHub(() => START)
    before.publish(snap(1))
    const seen = before.lastId()
    const after = createServerHub(() => START + 60_000)
    after.publish(snap(2))
    const { get } = buildTestApp({ hub: after })
    const res = await get('/api/stream', { 'Last-Event-ID': String(seen) })
    expect(types(await readSseBlocks(res, hasSync))).toEqual([
      'resync',
      'snapshot',
      'sync',
    ])
  })
})
