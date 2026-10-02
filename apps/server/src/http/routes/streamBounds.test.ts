import type { Snapshot } from '@orbit/contract'

import { buildTestApp } from '../../test/buildTestApp'
import { createCountingHub } from '../../test/createCountingHub'

const snap = (value: number): Snapshot => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: '2026-10-02T10:00:00.000Z' }],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
})

describe('GET /api/stream bounds', () => {
  it('closes a stream whose client stops reading once the queue reaches the ring size', async () => {
    const { hub, active } = createCountingHub(4)
    const res = await buildTestApp({ hub }).get('/api/stream')
    const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
      res.body?.getReader()
    await reader?.read()
    expect(active.size).toBe(1)
    for (let v = 1; v <= 50; v += 1) hub.publish(snap(v))
    expect(active.size).toBe(0)
    let text = ''
    for (;;) {
      const chunk = await reader?.read()
      if (chunk === undefined || chunk.done) break
      text += new TextDecoder().decode(chunk.value)
    }
    // At most the queued ring's worth reaches the client before the stream ends.
    expect(text.match(/"type":"snapshot"/g)?.length ?? 0).toBeLessThanOrEqual(4)
  })
  it('refuses HEAD before subscribing to the hub', async () => {
    const { hub, active } = createCountingHub()
    const { app, cookie } = buildTestApp({ hub })
    const res = await app.request('http://127.0.0.1:8790/api/stream', {
      method: 'HEAD',
      headers: {
        Host: '127.0.0.1:8790',
        'Sec-Fetch-Site': 'same-origin',
        Cookie: cookie,
      },
    })
    expect(res.status).toBe(405)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(active.size).toBe(0)
  })
})
