import { Hono } from 'hono'
import type { DatabaseSync } from 'node:sqlite'

import { createSession } from '../auth/createSession'
import { openAuthDb } from '../test/openAuthDb'
import { requireSession } from './requireSession'
import { SESSION_COOKIE } from './sessionCookieName'

const build = (db: DatabaseSync) => {
  const app = new Hono()
  app.use(
    '*',
    requireSession(db, () => Date.now()),
  )
  app.get('/', (c) => c.text('ok'))
  return app
}

const withCookie = (value: string) => ({
  headers: { Cookie: `${SESSION_COOKIE}=${value}` },
})

describe('requireSession', () => {
  it('admits only a live session cookie', async () => {
    const db = openAuthDb()
    const id = createSession(db, Date.now())
    const app = build(db)
    expect((await app.request('/')).status).toBe(401)
    expect((await app.request('/', withCookie('bad'))).status).toBe(401)
    expect((await app.request('/', withCookie(id))).status).toBe(200)
  })
  it('rejects an over-long cookie without touching the database', async () => {
    const db = openAuthDb()
    const prepare = vi.spyOn(db, 'prepare')
    const res = await build(db).request('/', withCookie('a'.repeat(65)))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthorized' })
    expect(prepare).not.toHaveBeenCalled()
  })
  it('rejects the session once it has expired', async () => {
    const db = openAuthDb()
    const id = createSession(db, Date.now() - 365 * 86_400_000)
    expect((await build(db).request('/', withCookie(id))).status).toBe(401)
  })
})
