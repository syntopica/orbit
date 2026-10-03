import { clipsViewSchema, type Snapshot } from '@orbit/contract'

import { createHub } from '../../hub/createHub'
import { ProcessError } from '../../process/ProcessError'
import { buildTestApp } from '../../test/buildTestApp'
import type { ClipsDocuments } from '../../types/ClipsDocuments'

const route = '/api/clips'
const docs: ClipsDocuments = {
  status: {
    schemaVersion: 1,
    total: 10,
    states: { reconciled: 4, pending: 3, 'needs-claude': 2, 'bad state': 1 },
    oldestAt: { pending: '2026-10-01T00:00:00.000Z', 'needs-claude': null },
    intake: {
      days: [
        { day: '2026-10-02', count: 2 },
        { day: 'yesterday', count: 1 },
      ],
      undated: 1,
    },
  },
  doctor: {
    schemaVersion: 1,
    ok: false,
    checks: [
      { name: 'archive', ok: false, code: 'archive_public_remote' },
      { name: 'paths', ok: true, code: 'free text' },
      { name: 'invalid name', ok: true, code: 'ok' },
    ],
  },
}
const capture = (state: 'ok' | 'down'): Snapshot => ({
  component: 'capture',
  health: { state, reason: state === 'down' ? 'unreachable' : null },
  metrics:
    state === 'ok'
      ? [{ key: 'capture.undrained', value: 2, at: '2026-10-03T10:00:00.000Z' }]
      : [],
  pending:
    state === 'ok'
      ? [
          {
            key: 'capture.undrained',
            count: 2,
            oldestAt: '2026-10-02T08:00:00.000Z',
          },
        ]
      : [],
  events: [],
  observedAt: '2026-10-03T10:00:00.000Z',
  lastGood: null,
})
const appWith = (snapshot: Snapshot | null) => {
  const hub = createHub({ ringSize: 10, recentEvents: 5, firstId: 1 })
  if (snapshot !== null) hub.publish(snapshot)
  return buildTestApp({ hub, clips: async () => Promise.resolve(docs) })
}

describe('GET /api/clips', () => {
  it('requires a session before running the reader', async () => {
    const clips = vi.fn(async () => await Promise.resolve(docs))
    const res = await buildTestApp({ clips }).get(route, { Cookie: '' })
    expect(res.status).toBe(401)
    expect(clips).not.toHaveBeenCalled()
  })
  it('answers ordered states, dated intake, coded checks and the capture lane', async () => {
    const res = await appWith(capture('ok')).get(route)
    expect(res.status).toBe(200)
    const view = clipsViewSchema.parse(await res.json())
    expect(view.states).toEqual([
      {
        state: 'pending',
        count: 3,
        oldestAt: Date.parse('2026-10-01T00:00:00.000Z'),
      },
      { state: 'needs-claude', count: 2, oldestAt: null },
      { state: 'reconciled', count: 4, oldestAt: null },
    ])
    expect(view.intake).toEqual({
      days: [{ day: '2026-10-02', count: 2 }],
      undated: 1,
    })
    expect(view.doctor).toEqual({
      ok: false,
      checks: [
        { name: 'archive', ok: false, code: 'archive_public_remote' },
        { name: 'paths', ok: true, code: null },
      ],
    })
    expect(view.capture).toEqual({
      count: 2,
      oldestAt: Date.parse('2026-10-02T08:00:00.000Z'),
    })
  })
  it('leaves the capture lane out when capture is absent or down', async () => {
    for (const snapshot of [
      null,
      capture('down'),
      { ...capture('ok'), metrics: [] },
    ]) {
      const view = clipsViewSchema.parse(
        await (await appWith(snapshot).get(route)).json(),
      )
      expect(view.capture).toBeNull()
    }
  })
  it('answers a fixed 503 when clips is not configured or fails', async () => {
    expect((await buildTestApp().get(route)).status).toBe(503)
    const res = await buildTestApp({
      clips: async () => Promise.reject(new ProcessError('not_found')),
    }).get(route)
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'unavailable' })
  })
})
