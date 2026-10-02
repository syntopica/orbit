import { Hono } from 'hono'

import { createDetailPool } from '../scheduler/createDetailPool'
import type { AppDeps } from '../types/AppDeps'
import type { OrbitEnv } from '../types/OrbitEnv'
import { hostAllowlist } from './hostAllowlist'
import { requireCsrfHeader } from './requireCsrfHeader'
import { requireSameOrigin } from './requireSameOrigin'
import { requireSession } from './requireSession'
import { authBodyLimit } from './routes/authBodyLimit'
import { getLaunchdHistory } from './routes/getLaunchdHistory'
import { getLaunchdRows } from './routes/getLaunchdRows'
import { getSnapshots } from './routes/getSnapshots'
import { getStream } from './routes/getStream'
import { postLogout } from './routes/postLogout'
import { postPair } from './routes/postPair'
import { postSession } from './routes/postSession'
import { securityHeaders } from './securityHeaders'
import { serveWeb } from './serveWeb'
import { tailnetLogin } from './tailnetLogin'

export const createApp = (deps: AppDeps): Hono<OrbitEnv> => {
  const auth = { db: deps.authDb, now: deps.now }
  const pool = createDetailPool(2)
  const app = new Hono<OrbitEnv>()
  // securityHeaders first, so every refusal below carries the headers too.
  app.use(
    '*',
    securityHeaders(),
    hostAllowlist(deps.guard),
    tailnetLogin(deps.guard),
  )
  app.use('/api/*', requireSameOrigin(deps.guard), requireCsrfHeader())
  app.post('/api/session', authBodyLimit(), postSession(auth))
  app.post('/api/pair', authBodyLimit(), postPair(auth))
  const api = new Hono<OrbitEnv>()
  api.use('*', requireSession(deps.authDb, deps.now))
  api.post('/logout', postLogout(auth))
  api.get('/snapshots', getSnapshots(deps.hub))
  api.get('/stream', getStream(deps.hub))
  api.get('/launchd', getLaunchdRows(deps.catalog, pool))
  api.get(
    '/launchd/history',
    getLaunchdHistory(deps.historyDb, deps.catalog, pool, deps.now),
  )
  api.all('*', (c) => c.json({ error: 'not_found' }, 404))
  app.route('/api', api)
  serveWeb(app, deps.webRoot)
  return app
}
