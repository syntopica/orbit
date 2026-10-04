import { atriumViewSchema } from '@orbit/contract'

import { ProcessError } from '../../process/ProcessError'
import { atriumDoctorDocument } from '../../test/atriumDoctorDocument'
import { atriumRefreshDocument } from '../../test/atriumRefreshDocument'
import { atriumSynthesisDocument } from '../../test/atriumSynthesisDocument'
import { buildTestApp } from '../../test/buildTestApp'
import type { AtriumDocuments } from '../../types/AtriumDocuments'

const ATRIUM = '/api/atrium'
const docs: AtriumDocuments = {
  refresh: atriumRefreshDocument({
    records: { total: 3, bySource: { 'source-a': 1, 'bad source': 2 } },
    content: { at: null },
    populations: [
      { model: 'model-a', intended: 4, indexed: 1 },
      { model: 'model a', intended: 1, indexed: 0 },
    ],
  }),
  synthesis: atriumSynthesisDocument({ producer: 'free text here' }),
  doctor: atriumDoctorDocument({
    checks: [
      { name: 'archive', ok: true, severity: 'ok', code: 'archive_fresh' },
      { name: 'bad name', ok: false, severity: 'broken', code: 'x' },
      { name: 'refresh', ok: false, severity: 'warn', code: 'free text' },
    ],
  }),
}
const atriumWith = (read: () => Promise<AtriumDocuments>) => ({
  atrium: { read, refreshIntervalMs: 3_600_000 },
})

describe('GET /api/atrium', () => {
  it('answers counts, instants and identifiers only', async () => {
    const res = await buildTestApp(
      atriumWith(async () => Promise.resolve(docs)),
    ).get(ATRIUM)
    expect(res.status).toBe(200)
    const view = atriumViewSchema.parse(await res.json())
    expect(view.now).toBe(1_790_000_000_000)
    expect(view.records.bySource).toEqual([{ source: 'source-a', count: 1 }])
    expect(view.populations).toEqual([
      { model: 'model-a', intended: 4, indexed: 1 },
    ])
    expect(view.refreshAt).toBe(Date.parse('2026-10-03T11:30:00.000Z'))
    expect(view.contentAt).toBeNull()
    expect(view.synthesis).toMatchObject({
      synthesized: 6,
      deferred: 4,
      producer: null,
      durationMs: 1_200_000,
    })
    expect(view.doctor).toEqual({
      writtenAt: Date.parse('2026-10-03T11:30:00Z'),
      stale: false,
      ok: false,
      checks: [
        { name: 'archive', ok: true, severity: 'ok', code: 'archive_fresh' },
        { name: 'refresh', ok: false, severity: 'warn', code: null },
      ],
    })
  })
  it('answers a null doctor until atrium publishes one', async () => {
    const res = await buildTestApp(
      atriumWith(async () => Promise.resolve({ ...docs, doctor: null })),
    ).get(ATRIUM)
    expect(atriumViewSchema.parse(await res.json()).doctor).toBeNull()
  })
  it('answers a fixed 503 when atrium is not configured or unreadable', async () => {
    const off = await buildTestApp().get(ATRIUM)
    expect(off.status).toBe(503)
    const failing = await buildTestApp(
      atriumWith(async () =>
        Promise.reject(new ProcessError('permission_denied')),
      ),
    ).get(ATRIUM)
    expect(failing.status).toBe(503)
    expect(await failing.json()).toEqual({ error: 'unavailable' })
  })
  it('requires a session before reading status documents', async () => {
    const read = vi.fn<() => Promise<AtriumDocuments>>().mockResolvedValue(docs)
    const response = await buildTestApp(atriumWith(read)).get(ATRIUM, {
      Cookie: '',
    })
    expect(response.status).toBe(401)
    expect(read).not.toHaveBeenCalled()
  })
  it('limits memory reads to two and expires queued work after four seconds', async () => {
    vi.useFakeTimers()
    try {
      const gate = Promise.withResolvers<AtriumDocuments>()
      const read = vi
        .fn<() => Promise<AtriumDocuments>>()
        .mockImplementation(async () => gate.promise)
      const { get } = buildTestApp(atriumWith(read))
      const requests = Promise.all([get(ATRIUM), get(ATRIUM), get(ATRIUM)])
      await vi.advanceTimersByTimeAsync(0)
      expect(read).toHaveBeenCalledTimes(2)
      await vi.advanceTimersByTimeAsync(4000)
      const responses = await requests
      expect(responses.map((response) => response.status)).toEqual([
        503, 503, 503,
      ])
      for (const response of responses) {
        expect(await response.json()).toEqual({ error: 'unavailable' })
      }
      expect(read).toHaveBeenCalledTimes(2)
      gate.resolve(docs)
      await vi.advanceTimersByTimeAsync(0)
    } finally {
      vi.useRealTimers()
    }
  })
})
