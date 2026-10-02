import { Hono } from 'hono'

import { hostAllowlist } from './hostAllowlist'
import { requireCsrfHeader } from './requireCsrfHeader'
import { requireSameOrigin } from './requireSameOrigin'
import { securityHeaders } from './securityHeaders'
import { tailnetLogin } from './tailnetLogin'

const config = {
  port: 8790,
  allowedHosts: ['orbit.example.ts.net'],
  allowedLogins: ['me@example.com'],
}

const app = new Hono()
app.use('*', hostAllowlist(config), securityHeaders(), tailnetLogin(config))
app.use('/api/*', requireSameOrigin(config), requireCsrfHeader())
app.get('/api/x', (c) => c.json({ ok: true }))
app.post('/api/x', (c) => c.json({ ok: true }))
app.get('/page', (c) => c.text('page'))

type Headers = Record<string, string>

const fromHere: Headers = { Origin: 'http://127.0.0.1:8790' }

const call = async (
  path: string,
  init: { method?: string; headers?: Headers; dropHeaders?: string[] } = {},
) => {
  const merged: Headers = {
    Host: '127.0.0.1:8790',
    'Sec-Fetch-Site': 'same-origin',
    ...init.headers,
  }
  const dropped = new Set(init.dropHeaders ?? [])
  const headers = Object.fromEntries(
    Object.entries(merged).filter(([name]) => !dropped.has(name)),
  )
  return app.request(`http://127.0.0.1:8790${path}`, {
    ...(init.method === undefined ? {} : { method: init.method }),
    headers,
  })
}

const status = async (...args: Parameters<typeof call>) =>
  (await call(...args)).status

describe('host allowlist', () => {
  it('rejects an unknown Host (DNS rebinding)', async () => {
    expect(await status('/api/x', { headers: { Host: 'evil.example' } })).toBe(
      421,
    )
  })
  it('rejects a Host that only contains or ends with an allowed one', async () => {
    for (const host of [
      'evil-orbit.example.ts.net',
      'orbit.example.ts.net.evil.example',
      '127.0.0.1:8791',
      '127.0.0.1',
      'localhost',
    ]) {
      expect(await status('/page', { headers: { Host: host } })).toBe(421)
    }
  })
  it('rejects a missing Host and answers with a fixed body', async () => {
    const res = await call('/page', { dropHeaders: ['Host'] })
    expect(res.status).toBe(421)
    expect(await res.json()).toEqual({ error: 'misdirected' })
  })
  it('accepts the loopback and tailnet hosts', async () => {
    expect(await status('/page')).toBe(200)
    expect(await status('/page', { headers: { Host: 'localhost:8790' } })).toBe(
      200,
    )
  })
})

describe('security headers', () => {
  it('accepts the tailnet host with its HTTPS origin and sets headers', async () => {
    const res = await call('/api/x', {
      headers: {
        Host: 'orbit.example.ts.net',
        Origin: 'https://orbit.example.ts.net',
      },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    const csp = res.headers.get('content-security-policy') ?? ''
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("default-src 'self'")
    expect(res.headers.get('referrer-policy')).toBe('no-referrer')
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })
  it('does not force no-store outside /api', async () => {
    const res = await call('/page')
    expect(res.headers.get('cache-control')).toBeNull()
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })
})

describe('same-origin guard', () => {
  it('rejects a cross-site origin and a missing same-origin signal', async () => {
    expect(
      await status('/api/x', { headers: { Origin: 'https://evil.example' } }),
    ).toBe(403)
    expect(
      await status('/api/x', { headers: { 'Sec-Fetch-Site': 'cross-site' } }),
    ).toBe(403)
    expect(await status('/api/x', { dropHeaders: ['Sec-Fetch-Site'] })).toBe(
      403,
    )
  })
  it('rejects an origin differing only in scheme, port or host', async () => {
    for (const origin of [
      'https://127.0.0.1:8790',
      'http://127.0.0.1:8791',
      'http://orbit.example.ts.net',
      'https://orbit.example.ts.net:8443',
      'https://evil-orbit.example.ts.net',
      'null',
    ]) {
      expect(await status('/api/x', { headers: { Origin: origin } })).toBe(403)
    }
  })
  it('accepts the Sec-Fetch-Site fallback only for GET and HEAD', async () => {
    const noOrigin = { 'X-Orbit': '1' }
    expect(await status('/api/x', { method: 'POST', headers: noOrigin })).toBe(
      403,
    )
    expect(await status('/api/x', { method: 'HEAD' })).toBe(200)
  })
  it('pins the fallback to exactly same-origin', async () => {
    for (const site of ['same-site', 'none', '']) {
      expect(
        await status('/api/x', { headers: { 'Sec-Fetch-Site': site } }),
      ).toBe(403)
    }
  })
  it('does not let Sec-Fetch-Site override a bad Origin', async () => {
    expect(
      await status('/api/x', {
        headers: {
          Origin: 'https://evil.example',
          'Sec-Fetch-Site': 'same-origin',
        },
      }),
    ).toBe(403)
  })
  it('answers with a fixed body', async () => {
    const res = await call('/api/x', {
      headers: { Origin: 'https://evil.example' },
    })
    expect(await res.json()).toEqual({ error: 'forbidden' })
  })
})

describe('csrf header', () => {
  it('requires X-Orbit: 1 on mutations', async () => {
    const post = async (extra: Headers) =>
      status('/api/x', { method: 'POST', headers: { ...fromHere, ...extra } })
    expect(await post({})).toBe(403)
    expect(await post({ 'X-Orbit': '0' })).toBe(403)
    expect(await post({ 'X-Orbit': '1' })).toBe(200)
  })
  it('rejects OPTIONS, PUT and DELETE without X-Orbit', async () => {
    for (const method of ['OPTIONS', 'PUT', 'DELETE']) {
      expect(await status('/api/x', { method, headers: fromHere })).toBe(403)
    }
  })
})

describe('tailnet login', () => {
  it('rejects a present but empty login', async () => {
    const empty = { 'Tailscale-User-Login': '' }
    expect(await status('/page', { headers: empty })).toBe(403)
  })
  it('refuses a login that is not allowed and admits an allowed one', async () => {
    const other = { 'Tailscale-User-Login': 'other@example.com' }
    const mine = { 'Tailscale-User-Login': 'me@example.com' }
    expect(await status('/api/x', { headers: other })).toBe(403)
    expect(await status('/api/x', { headers: mine })).toBe(200)
  })
  it('refuses a login that only resembles an allowed one', async () => {
    const login = { 'Tailscale-User-Login': 'Me@example.com' }
    expect(await status('/page', { headers: login })).toBe(403)
  })
})
