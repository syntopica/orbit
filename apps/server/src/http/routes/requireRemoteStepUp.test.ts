import { Hono } from 'hono'

import { markStepUp } from '../../auth/markStepUp'
import { buildTestApp } from '../../test/buildTestApp'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { requireRemoteStepUp } from './requireRemoteStepUp'

const REMOTE = 'orbit.example.ts.net'

const setup = () => {
  let now = 1_790_000_000_000
  const test = buildTestApp({
    now: () => now,
    guard: { port: 8790, allowedHosts: [REMOTE], allowedLogins: [] },
  })
  const app = new Hono<OrbitEnv>()
  app.post('/act', requireRemoteStepUp(test.deps), (c) => c.text('done'))
  const post = async (host: string, cookie = test.cookie) =>
    app.request('http://x/act', {
      method: 'POST',
      headers: { Host: host, Cookie: cookie },
    })
  const session = test.cookie.split('=')[1] ?? ''
  return {
    post,
    stepUp: () => markStepUp(test.authDb, session, now),
    advance: (ms: number) => {
      now += ms
    },
  }
}

describe('requireRemoteStepUp', () => {
  it('lets a loopback request through without a step-up', async () => {
    const { post } = setup()
    expect((await post('127.0.0.1:8790')).status).toBe(200)
  })
  it('refuses a remote request until the token was re-entered', async () => {
    const { post, stepUp, advance } = setup()
    const refused = await post(REMOTE)
    expect(refused.status).toBe(403)
    expect(await refused.json()).toEqual({ error: 'step_up_required' })
    expect(stepUp()).toBe(true)
    expect((await post(REMOTE)).status).toBe(200)
    advance(300_000)
    expect((await post(REMOTE)).status).toBe(403)
  })
  it('refuses a remote request with no session cookie', async () => {
    const { post } = setup()
    expect((await post(REMOTE, '')).status).toBe(403)
  })
})
