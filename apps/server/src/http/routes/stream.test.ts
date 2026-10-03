import type { Snapshot, StreamMessage } from '@orbit/contract'

import { createSession } from '../../auth/createSession'
import { createHub } from '../../hub/createHub'
import { openAuthDb } from '../../test/openAuthDb'
import { openHistoryDb } from '../../test/openHistoryDb'
import { createApp } from '../createApp'

const STREAM_URL = 'http://127.0.0.1:8790/api/stream'

const snap = (value: number): Snapshot => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: '2026-10-02T10:00:00.000Z' }],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
})

const readMessages = async (
  res: Response,
  count: number,
): Promise<StreamMessage[]> => {
  const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
    res.body?.getReader()
  const decoder = new TextDecoder()
  let text = ''
  const messages: StreamMessage[] = []
  while (reader !== undefined && messages.length < count) {
    const chunk = await reader.read()
    if (chunk.done) break
    text += decoder.decode(chunk.value)
    const blocks = text.split('\n\n')
    text = blocks.pop() ?? ''
    for (const block of blocks) {
      const data = block.split('\n').find((line) => line.startsWith('data: '))
      if (data !== undefined)
        messages.push(JSON.parse(data.slice(6)) as StreamMessage)
    }
  }
  await reader?.cancel()
  return messages
}

const setup = () => {
  const authDb = openAuthDb()
  const hub = createHub({ ringSize: 2, recentEvents: 5, firstId: 1 })
  const app = createApp({
    authDb,
    historyDb: openHistoryDb(),
    hub,
    stageLabels: new Map(),
    catalog: null,
    worker: null,
    atrium: null,
    clips: null,
    brain: null,
    workerActivity: null,
    guard: { port: 8790, allowedHosts: [], allowedLogins: [] },
    webRoot: '/nonexistent',
    now: () => Date.now(),
  })
  const headers = (extra: Record<string, string> = {}) => ({
    Host: '127.0.0.1:8790',
    'Sec-Fetch-Site': 'same-origin',
    Cookie: `__Host-orbit_session=${createSession(authDb, Date.now())}`,
    ...extra,
  })
  return { app, hub, headers }
}

describe('GET /api/stream', () => {
  it('sends the current snapshots then a sync marker', async () => {
    const { app, hub, headers } = setup()
    hub.publish(snap(1))
    const res = await app.request(STREAM_URL, {
      headers: headers(),
    })
    const messages = await readMessages(res, 2)
    expect(messages.map((m) => m.type)).toEqual(['snapshot', 'sync'])
  })
  it('puts an SSE id only on the closing sync of an opening', async () => {
    const { app, hub, headers } = setup()
    hub.publish(snap(1))
    const res = await app.request(STREAM_URL, {
      headers: headers(),
    })
    const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
      res.body?.getReader()
    let text = ''
    while (reader !== undefined && !text.includes('"type":"sync"')) {
      const chunk = await reader.read()
      if (chunk.done) break
      text += new TextDecoder().decode(chunk.value)
    }
    await reader?.cancel()
    const blocks = text.split('\n\n').filter((b) => b.includes('data: '))
    expect(
      blocks.map((b) => b.includes('\nid: ') || b.startsWith('id: ')),
    ).toEqual([false, true])
  })
  it('replays after a known id inside the ring', async () => {
    const { app, hub, headers } = setup()
    hub.publish(snap(1))
    hub.publish(snap(2))
    const res = await app.request(STREAM_URL, {
      headers: headers({ 'Last-Event-ID': '1' }),
    })
    const messages = await readMessages(res, 2)
    expect(messages.map((m) => [m.type, m.id])).toEqual([
      ['snapshot', 2],
      ['sync', 2],
    ])
  })
  it('resyncs when the id fell out of the ring', async () => {
    const { app, hub, headers } = setup()
    ;[1, 2, 3, 4].forEach((v) => {
      hub.publish(snap(v))
    })
    const res = await app.request(STREAM_URL, {
      headers: headers({ 'Last-Event-ID': '0' }),
    })
    const messages = await readMessages(res, 3)
    expect(messages.map((m) => m.type)).toEqual(['resync', 'snapshot', 'sync'])
  })
})
