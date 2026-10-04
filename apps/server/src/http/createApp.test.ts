import { mkdir, mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createHub } from '../hub/createHub'
import { buildTestApp } from '../test/buildTestApp'
import { openAuthDb } from '../test/openAuthDb'
import { openHistoryDb } from '../test/openHistoryDb'
import { createApp } from './createApp'

const SNAPSHOTS = '/api/snapshots'

const makeWebRoot = async () => {
  const webRoot = await mkdtemp(join(tmpdir(), 'orbit-web-'))
  await writeFile(
    join(webRoot, 'index.html'),
    '<!doctype html><title>orbit</title>',
  )
  await writeFile(join(webRoot, 'app.js'), 'console.log(1)')
  return webRoot
}

const html = { Accept: 'text/html,application/xhtml+xml' }

describe('createApp static files', () => {
  it('serves assets and falls back to index.html for client routes', async () => {
    const webRoot = await makeWebRoot()
    const app = createApp({
      authDb: openAuthDb(),
      historyDb: openHistoryDb(),
      hub: createHub({ ringSize: 2, recentEvents: 2, firstId: 1 }),
      stageLabels: new Map(),
      catalog: null,
      worker: null,
      atrium: null,
      clips: null,
      brain: null,
      workerActivity: null,
      workerCosts: null,
      workerQuality: null,
      workerJobs: null,
      guard: { port: 8790, allowedHosts: [], allowedLogins: [] },
      webRoot,
      now: () => Date.now(),
    })
    const get = async (path: string) =>
      app.request(`http://127.0.0.1:8790${path}`, {
        headers: { Host: '127.0.0.1:8790', ...html },
      })
    const asset = await get('/app.js')
    expect(await asset.text()).toBe('console.log(1)')
    expect(asset.headers.get('content-type')).toContain('javascript')
    const page = await get('/system')
    expect(await page.text()).toContain('<title>orbit</title>')
    expect(page.headers.get('content-security-policy')).toContain(
      "default-src 'self'",
    )
    expect(await (await get('/')).text()).toContain('<title>orbit</title>')
  })
  it('falls back only for requests that accept HTML', async () => {
    const { get } = buildTestApp({ webRoot: await makeWebRoot() })
    const res = await get('/missing.js', { Accept: '*/*' })
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'not_found' })
    expect((await buildTestApp().get('/system', html)).status).toBe(404)
  })
  it('never follows a symlink out of webRoot', async () => {
    const webRoot = await makeWebRoot()
    const outside = await mkdtemp(join(tmpdir(), 'orbit-outside-'))
    await writeFile(join(outside, 'secret.txt'), 'outside')
    await symlink(join(outside, 'secret.txt'), join(webRoot, 'leak.txt'))
    await symlink(outside, join(webRoot, 'dir'))
    const { get } = buildTestApp({ webRoot })
    for (const path of ['/leak.txt', '/dir/secret.txt']) {
      const res = await get(path, { Accept: '*/*' })
      expect(res.status).toBe(404)
      expect(await res.text()).not.toContain('outside')
    }
  })
  it('refuses a sibling directory that shares the web root name as a prefix', async () => {
    const webRoot = await makeWebRoot()
    await mkdir(`${webRoot}-evil`)
    await writeFile(join(`${webRoot}-evil`, 'secret.txt'), 'outside')
    await symlink(`${webRoot}-evil`, join(webRoot, 'sibling'))
    const res = await buildTestApp({ webRoot }).get('/sibling/secret.txt', {
      Accept: '*/*',
    })
    expect(res.status).toBe(404)
    expect(await res.text()).not.toContain('outside')
  })
  it('never serves static files under /api', async () => {
    const { get } = buildTestApp({ webRoot: await makeWebRoot() })
    for (const path of ['/api/app.js', '/api/no-such', '/api']) {
      const res = await get(path, html)
      expect(res.status).toBe(404)
      expect(await res.json()).toEqual({ error: 'not_found' })
    }
  })
})

describe('createApp security headers', () => {
  it('sets them on refusals too: 421, 403 and 401', async () => {
    const { get } = buildTestApp()
    const refusals = [
      await get(SNAPSHOTS, { Host: 'evil.example' }),
      await get(SNAPSHOTS, { 'Sec-Fetch-Site': 'cross-site' }),
      await get(SNAPSHOTS, { Cookie: '' }),
    ]
    expect(refusals.map((r) => r.status)).toEqual([421, 403, 401])
    for (const res of refusals) {
      expect(res.headers.get('content-security-policy')).toContain(
        "default-src 'self'",
      )
      expect(res.headers.get('referrer-policy')).toBe('no-referrer')
      expect(res.headers.get('x-content-type-options')).toBe('nosniff')
    }
  })
  it('serves the snapshot set to a session', async () => {
    const { get } = buildTestApp()
    expect(await (await get(SNAPSHOTS)).json()).toEqual({
      lastId: 0,
      snapshots: [],
      events: [],
    })
  })
})
