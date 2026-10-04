import { pollerViewSchema } from '@orbit/contract'

import { createPollerRegistry } from '../../scheduler/createPollerRegistry'
import { buildTestApp } from '../../test/buildTestApp'

describe('GET /api/poller', () => {
  it('answers the tracked loops under the contract', async () => {
    const poller = createPollerRegistry(() => 1_789_999_999_000)
    poller.tracker('brain').attempt()
    const res = await buildTestApp({ poller }).get('/api/poller')
    expect(res.status).toBe(200)
    const body = pollerViewSchema.parse(await res.json())
    expect(body.now).toBe(1_790_000_000_000)
    expect(body.rows).toMatchObject([{ component: 'brain', running: true }])
  })
  it('answers no rows without a registry and refuses without a session', async () => {
    const { get, app } = buildTestApp()
    expect(await (await get('/api/poller')).json()).toMatchObject({ rows: [] })
    const res = await app.request('http://127.0.0.1:8790/api/poller', {
      headers: { Host: '127.0.0.1:8790', 'Sec-Fetch-Site': 'same-origin' },
    })
    expect(res.status).toBe(401)
  })
})
