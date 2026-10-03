import { createAdminToken } from '../../auth/createAdminToken'
import { createInvitation } from '../../auth/createInvitation'
import { createHub } from '../../hub/createHub'
import { openAuthDb } from '../../test/openAuthDb'
import { openHistoryDb } from '../../test/openHistoryDb'
import { createApp } from '../createApp'

const SESSION_PATH = '/api/session'

const setup = () => {
  const authDb = openAuthDb()
  // One fixed instant: a real clock could cross a rate-limit minute mid-test.
  const at = Date.now()
  const app = createApp({
    authDb,
    historyDb: openHistoryDb(),
    hub: createHub({ ringSize: 10, recentEvents: 5, firstId: 1 }),
    stageLabels: new Map(),
    catalog: null,
    worker: null,
    atrium: null,
    clips: null,
    brain: null,
    workerActivity: null,
    guard: { port: 8790, allowedHosts: [], allowedLogins: [] },
    webRoot: '/nonexistent',
    now: () => at,
  })
  const post = async (path: string, body: unknown, source = '10.0.0.1') =>
    app.request(`http://127.0.0.1:8790${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Host: '127.0.0.1:8790',
        Origin: 'http://127.0.0.1:8790',
        'X-Orbit': '1',
        'Content-Type': 'application/json',
        'X-Forwarded-For': source,
      },
    })
  return { authDb, app, post }
}

describe('auth routes', () => {
  it('opens a session with the admin token and sets a hardened cookie', async () => {
    const { authDb, post } = setup()
    const token = createAdminToken(authDb, Date.now())
    const res = await post(SESSION_PATH, { token })
    expect(res.status).toBe(204)
    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie).toContain('__Host-orbit_session=')
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/Secure/i)
    expect(cookie).toMatch(/SameSite=Strict/i)
  })
  it('answers every failure the same way and rate limits per source', async () => {
    const { authDb, post } = setup()
    const token = createAdminToken(authDb, Date.now())
    const statuses: number[] = []
    for (let i = 0; i < 5; i += 1)
      statuses.push((await post(SESSION_PATH, { token: 'wrong' })).status)
    statuses.push((await post(SESSION_PATH, { token })).status)
    expect(statuses).toEqual([401, 401, 401, 401, 401, 401])
    expect((await post(SESSION_PATH, { token }, '10.0.0.2')).status).toBe(204)
    expect(
      await (await post(SESSION_PATH, { nope: 1 }, '10.0.0.3')).json(),
    ).toEqual({ error: 'unauthorized' })
  })
  it('redeems a pairing invitation once', async () => {
    const { authDb, post } = setup()
    const invitation = createInvitation(authDb, Date.now())
    expect((await post('/api/pair', invitation)).status).toBe(204)
    expect((await post('/api/pair', invitation)).status).toBe(401)
  })
  it('requires a session for data routes and unknown API paths alike', async () => {
    const { app } = setup()
    for (const path of ['/api/snapshots', '/api/no-such-route']) {
      const res = await app.request(`http://127.0.0.1:8790${path}`, {
        headers: { Host: '127.0.0.1:8790', 'Sec-Fetch-Site': 'same-origin' },
      })
      expect(res.status).toBe(401)
    }
  })
})
