import { Hono } from 'hono'

import { createDetailPool } from '../scheduler/createDetailPool'
import type { AppDeps } from '../types/AppDeps'
import type { OrbitEnv } from '../types/OrbitEnv'
import { hostAllowlist } from './hostAllowlist'
import { refuseHead } from './refuseHead'
import { requireCsrfHeader } from './requireCsrfHeader'
import { requireSameOrigin } from './requireSameOrigin'
import { requireSession } from './requireSession'
import { authBodyLimit } from './routes/authBodyLimit'
import { getAtrium } from './routes/getAtrium'
import { getClips } from './routes/getClips'
import { getLaunchdHistory } from './routes/getLaunchdHistory'
import { getLaunchdRows } from './routes/getLaunchdRows'
import { getMemoryFlow } from './routes/getMemoryFlow'
import { getMetricHistory } from './routes/getMetricHistory'
import { getPending } from './routes/getPending'
import { getSnapshots } from './routes/getSnapshots'
import { getStream } from './routes/getStream'
import { postLogout } from './routes/postLogout'
import { postPair } from './routes/postPair'
import { postSession } from './routes/postSession'
import { postStepUp } from './routes/postStepUp'
import { registerBrainRoutes } from './routes/registerBrainRoutes'
import { registerWorkerDetailRoutes } from './routes/registerWorkerDetailRoutes'
import { registerWorkerJobRoutes } from './routes/registerWorkerJobRoutes'
import { securityHeaders } from './securityHeaders'
import { serveWeb } from './serveWeb'
import { tailnetLogin } from './tailnetLogin'

export const createApp = (deps: AppDeps): Hono<OrbitEnv> => {
  const auth = { db: deps.authDb, now: deps.now }
  const pool = createDetailPool(2)
  const workerPool = createDetailPool(2)
  const memoryPool = createDetailPool(2)
  const app = new Hono<OrbitEnv>()
  // Fixed JSON only: the error itself is never logged or returned (spec 8).
  app.onError((_error, c) => c.json({ error: 'internal' }, 500))
  app.notFound((c) => c.json({ error: 'not_found' }, 404))
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
  api.post('/session/step-up', authBodyLimit(), postStepUp(auth))
  api.get('/snapshots', getSnapshots(deps.hub))
  api.get('/stream', refuseHead(), getStream(deps.hub, deps.authDb, deps.now))
  api.get('/launchd', getLaunchdRows(deps.catalog, pool))
  api.get(
    '/launchd/history',
    getLaunchdHistory(deps.historyDb, deps.catalog, pool, deps.now),
  )
  api.get('/history/metrics', getMetricHistory(deps.historyDb, deps.now))
  api.get('/clips', getClips(deps.clips, deps.hub, memoryPool, deps.now))
  api.get('/memory/flow', getMemoryFlow(deps, memoryPool))
  api.get('/atrium', getAtrium(deps.atrium, memoryPool, deps.now))
  api.get('/pending', getPending(deps, memoryPool))
  registerWorkerDetailRoutes(api, deps, workerPool)
  registerWorkerJobRoutes(api, deps, workerPool)
  registerBrainRoutes(api, deps.brain, memoryPool, deps.now)
  api.all('*', (c) => c.json({ error: 'not_found' }, 404))
  app.route('/api', api)
  serveWeb(app, deps.webRoot)
  return app
}
