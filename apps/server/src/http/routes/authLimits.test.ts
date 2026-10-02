import { createAdminToken } from '../../auth/createAdminToken'
import { createInvitation } from '../../auth/createInvitation'
import { hashSecret } from '../../auth/hashSecret'
import { buildTestApp } from '../../test/buildTestApp'

vi.mock('../../auth/hashSecret', async (importOriginal) => {
  const original = await importOriginal<{ hashSecret: typeof hashSecret }>()
  return { hashSecret: vi.fn(original.hashSecret) }
})

const SESSION_PATH = '/api/session'

const from = (source: string) => ({ 'X-Forwarded-For': source })

describe('auth route input bounds', () => {
  it('refuses a body over 4 KiB before parsing, with a fixed answer', async () => {
    const { post } = buildTestApp()
    for (const path of [SESSION_PATH, '/api/pair']) {
      const res = await post(path, JSON.stringify({ token: 'a'.repeat(5000) }))
      expect(res.status).toBe(413)
      expect(await res.json()).toEqual({ error: 'too_large' })
    }
  })
  it('turns non-string, oversized or extra fields into the same 401', async () => {
    const { post } = buildTestApp()
    vi.mocked(hashSecret).mockClear()
    const bodies = [
      { token: 12_345 },
      { token: { length: 43 } },
      { token: 'a'.repeat(44) },
      { token: 'a'.repeat(43), extra: 1 },
    ]
    for (const [i, body] of bodies.entries()) {
      const res = await post(
        SESSION_PATH,
        JSON.stringify(body),
        from(`10.1.0.${String(i)}`),
      )
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'unauthorized' })
    }
    for (const [i, body] of [
      { id: 'a'.repeat(11), secret: { not: 'a string' } },
      { id: 'a'.repeat(33), secret: 'b'.repeat(22) },
      { id: 'a'.repeat(11), secret: 'b'.repeat(65) },
      'not json',
    ].entries()) {
      const raw = typeof body === 'string' ? body : JSON.stringify(body)
      const res = await post('/api/pair', raw, from(`10.2.0.${String(i)}`))
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'unauthorized' })
    }
    expect(hashSecret).not.toHaveBeenCalled()
  })
})

describe('auth rate limits', () => {
  it('refuses the 31st attempt across distinct sources at the global limit', async () => {
    const { authDb, post } = buildTestApp()
    const token = createAdminToken(authDb, 0)
    const statuses: number[] = []
    for (let i = 0; i < 31; i += 1) {
      const res = await post(
        SESSION_PATH,
        JSON.stringify({ token }),
        from(`10.3.0.${String(i)}`),
      )
      statuses.push(res.status)
    }
    expect(statuses.slice(0, 30).every((s) => s === 204)).toBe(true)
    expect(statuses[30]).toBe(401)
  })
  it('counts attempts the source bucket refused against the global bucket', async () => {
    const { authDb, post } = buildTestApp()
    const token = createAdminToken(authDb, 0)
    for (let i = 0; i < 10; i += 1)
      await post('/api/pair', '{}', from('10.4.0.1'))
    const statuses: number[] = []
    for (let i = 0; i < 21; i += 1) {
      const res = await post(
        SESSION_PATH,
        JSON.stringify({ token }),
        from(`10.5.0.${String(i)}`),
      )
      statuses.push(res.status)
    }
    expect(statuses.slice(0, 20).every((s) => s === 204)).toBe(true)
    expect(statuses[20]).toBe(401)
  })
})

describe('session cookie and audit', () => {
  it('sets and clears the cookie with the exact hardened attributes', async () => {
    const { authDb, post, get } = buildTestApp()
    const token = createAdminToken(authDb, 0)
    const login = await post(SESSION_PATH, JSON.stringify({ token }))
    expect(login.headers.get('set-cookie')).toMatch(
      /^__Host-orbit_session=[\w-]{43}; Max-Age=2592000; Path=\/; HttpOnly; Secure; SameSite=Strict$/,
    )
    const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0] ?? ''
    const logout = await post('/api/logout', '', { Cookie: cookie })
    expect(logout.status).toBe(204)
    expect(logout.headers.get('set-cookie')).toBe(
      '__Host-orbit_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict',
    )
    expect((await get('/api/snapshots', { Cookie: cookie })).status).toBe(401)
  })
  it('audits each outcome with closed actions and no credential', async () => {
    const { authDb, post, cookie } = buildTestApp()
    const token = createAdminToken(authDb, 0)
    const invitation = createInvitation(authDb, 0)
    await post(SESSION_PATH, JSON.stringify({ token: 'x' }))
    await post(SESSION_PATH, JSON.stringify({ token }))
    await post(
      '/api/pair',
      JSON.stringify({ ...invitation, secret: 'b'.repeat(22) }),
    )
    await post('/api/logout', '', { Cookie: cookie })
    const rows = authDb
      .prepare('SELECT action, outcome FROM audit ORDER BY rowid')
      .all()
    expect(rows.map((r) => ({ ...r }))).toEqual([
      { action: 'session.create', outcome: 'denied' },
      { action: 'session.create', outcome: 'ok' },
      { action: 'session.pair', outcome: 'denied' },
      { action: 'session.logout', outcome: 'ok' },
    ])
  })
})
