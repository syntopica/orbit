import { buildTestApp } from '../../test/buildTestApp'
import { insertSample } from '../../test/insertSample'
import { openHistoryDb } from '../../test/openHistoryDb'

const NOW = 1_790_000_000_000
const HISTORY = '/api/history/metrics'

describe('GET /api/history/metrics', () => {
  it('answers one component over one range on the server clock', async () => {
    const historyDb = openHistoryDb()
    insertSample(historyDb, 'clips', 'clips.pending', 3, NOW - 3_600_000)
    const res = await buildTestApp({ historyDb }).get(
      `${HISTORY}?component=clips&range=24h`,
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      now: NOW,
      from: NOW - 86_400_000,
      runs: [],
      series: [
        { key: 'clips.pending', points: [{ at: NOW - 3_600_000, value: 3 }] },
      ],
    })
  })
  it('refuses a missing or unknown component or range with a 400', async () => {
    const { get } = buildTestApp()
    for (const query of [
      'component=clips',
      'range=24h',
      'component=nope&range=24h',
      'component=clips&range=1y',
    ]) {
      const res = await get(`${HISTORY}?${query}`)
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'bad_request' })
    }
  })
  it('needs a session', async () => {
    const { app } = buildTestApp()
    const res = await app.request(
      `http://127.0.0.1:8790${HISTORY}?component=clips&range=24h`,
      { headers: { Host: '127.0.0.1:8790', 'Sec-Fetch-Site': 'same-origin' } },
    )
    expect(res.status).toBe(401)
  })
})
