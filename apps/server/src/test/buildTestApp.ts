import type { DatabaseSync } from 'node:sqlite'

import { createSession } from '../auth/createSession'
import { markStepUp } from '../auth/markStepUp'
import { createApp } from '../http/createApp'
import { createHub } from '../hub/createHub'
import type { AppDeps } from '../types/AppDeps'
import { openAuthDb } from './openAuthDb'
import { openHistoryDb } from './openHistoryDb'

// An app on a fixed clock with a live session cookie and loopback headers.
export const buildTestApp = (
  overrides: Partial<AppDeps> = {},
  options: { stepUp?: boolean } = {},
) => {
  const now = overrides.now ?? (() => 1_790_000_000_000)
  const authDb: DatabaseSync = overrides.authDb ?? openAuthDb()
  const deps: AppDeps = {
    authDb,
    historyDb: openHistoryDb(),
    hub: createHub({ ringSize: 10, recentEvents: 5, firstId: 1 }),
    catalog: null,
    stageLabels: new Map(),
    atrium: null,
    atriumContext: null,
    clips: null,
    brain: null,
    worker: null,
    workerActivity: null,
    workerCosts: null,
    workerQuality: null,
    workerJobs: null,
    guard: { port: 8790, allowedHosts: [], allowedLogins: [] },
    webRoot: '/nonexistent',
    ...overrides,
    now,
  }
  const app = createApp(deps)
  const session = createSession(authDb, now())
  if (options.stepUp === true) markStepUp(authDb, session, now())
  const cookie = `__Host-orbit_session=${session}`
  const get = async (path: string, headers: Record<string, string> = {}) =>
    app.request(`http://127.0.0.1:8790${path}`, {
      headers: {
        Host: '127.0.0.1:8790',
        'Sec-Fetch-Site': 'same-origin',
        Cookie: cookie,
        ...headers,
      },
    })
  const post = async (
    path: string,
    body: string,
    headers: Record<string, string> = {},
  ) =>
    app.request(`http://127.0.0.1:8790${path}`, {
      method: 'POST',
      body,
      headers: {
        Host: '127.0.0.1:8790',
        Origin: 'http://127.0.0.1:8790',
        'X-Orbit': '1',
        'Content-Type': 'application/json',
        ...headers,
      },
    })
  return { app, deps, authDb, cookie, get, post }
}
