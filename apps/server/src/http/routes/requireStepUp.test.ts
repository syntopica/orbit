import { Hono } from 'hono'

import { markStepUp } from '../../auth/markStepUp'
import { buildTestApp } from '../../test/buildTestApp'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { requireStepUp } from './requireStepUp'

const LOCAL = '127.0.0.1:8790'

const setup = () => {
  let now = 1_790_000_000_000
  const test = buildTestApp({ now: () => now })
  const app = new Hono<OrbitEnv>()
  app.post('/act', requireStepUp(test.deps), (c) => c.text('done'))
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

describe('requireStepUp', () => {
  it('refuses until the token was re-entered, whatever the Host says', async () => {
    const { post, stepUp, advance } = setup()
    for (const host of [LOCAL, 'orbit.example.ts.net']) {
      const refused = await post(host)
      expect(refused.status).toBe(403)
      expect(await refused.json()).toEqual({ error: 'step_up_required' })
    }
    expect(stepUp()).toBe(true)
    expect((await post(LOCAL)).status).toBe(200)
    advance(300_000)
    expect((await post(LOCAL)).status).toBe(403)
  })
  it('refuses a request with no session cookie', async () => {
    const { post } = setup()
    expect((await post(LOCAL, '')).status).toBe(403)
  })
  it('guards the worker job actions on the real routes', async () => {
    const { post, cookie } = buildTestApp({
      workerJobs: async () =>
        Promise.resolve({
          status: 200,
          body: '{"id":"job-1","state":"queued"}',
        }),
    })
    const refused = await post('/api/worker/jobs/job-1/cancel', '{}', {
      Cookie: cookie,
    })
    expect(refused.status).toBe(403)
    expect(await refused.json()).toEqual({ error: 'step_up_required' })
  })
})
