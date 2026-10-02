import { buildTestApp } from '../test/buildTestApp'
import { createCountingHub } from '../test/createCountingHub'
import type { Hub } from '../types/Hub'

const expectHeaders = (res: Response) => {
  expect(res.headers.get('content-security-policy')).toContain(
    "default-src 'self'",
  )
  expect(res.headers.get('x-content-type-options')).toBe('nosniff')
}

describe('createApp error contract', () => {
  it('answers a thrown error with fixed JSON and logs nothing', async () => {
    const { hub } = createCountingHub()
    const failing: Hub = {
      ...hub,
      snapshots: () => {
        throw new Error('secret content')
      },
    }
    const errors = vi.spyOn(console, 'error')
    const res = await buildTestApp({ hub: failing }).get('/api/snapshots')
    expect(res.status).toBe(500)
    expect(await res.text()).toBe('{"error":"internal"}')
    expectHeaders(res)
    expect(errors).not.toHaveBeenCalled()
  })
  it('answers an unrouted method with fixed JSON 404', async () => {
    const { app } = buildTestApp()
    const res = await app.request('http://127.0.0.1:8790/foo', {
      method: 'POST',
      headers: { Host: '127.0.0.1:8790' },
    })
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'not_found' })
    expectHeaders(res)
  })
})
