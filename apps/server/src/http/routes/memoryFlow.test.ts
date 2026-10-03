import { memoryFlowSchema } from '@orbit/contract'

import { atriumRefreshDocument } from '../../test/atriumRefreshDocument'
import { buildTestApp } from '../../test/buildTestApp'
import { insertSample } from '../../test/insertSample'
import { openHistoryDb } from '../../test/openHistoryDb'

const NOW = 1_790_000_000_000

describe('GET /api/memory/flow', () => {
  it('answers every stage and edge from snapshots, atrium and history', async () => {
    const historyDb = openHistoryDb()
    insertSample(
      historyDb,
      'atrium',
      'atrium.records',
      10,
      NOW - 30 * 3_600_000,
    )
    insertSample(historyDb, 'atrium', 'atrium.records', 34, NOW - 3_600_000)
    const refresh = atriumRefreshDocument({
      archive: { at: new Date(NOW - 60_000).toISOString() },
    })
    const res = await buildTestApp({
      historyDb,
      atrium: {
        read: async () => Promise.resolve({ refresh, synthesis: null }),
        refreshIntervalMs: 3_600_000,
      },
      stageLabels: new Map([['index' as const, 'com.example.refresh']]),
    }).get('/api/memory/flow')
    expect(res.status).toBe(200)
    const flow = memoryFlowSchema.parse(await res.json())
    expect(flow.stages).toHaveLength(8)
    expect(flow.stages.find((s) => s.id === 'index')?.label).toBe(
      'com.example.refresh',
    )
    expect(flow.edges.find((e) => e.to === 'synthesis')?.perHour).toBe(1)
  })
  it('still answers when atrium cannot be read', async () => {
    const res = await buildTestApp({
      atrium: {
        read: async () => Promise.reject(new Error('unreadable')),
        refreshIntervalMs: 3_600_000,
      },
    }).get('/api/memory/flow')
    expect(res.status).toBe(200)
    const flow = memoryFlowSchema.parse(await res.json())
    expect(flow.stages.every((s) => s.state === 'unknown')).toBe(true)
  })
})
