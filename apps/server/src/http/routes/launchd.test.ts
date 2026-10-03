import { createSession } from '../../auth/createSession'
import { recordLaunchdObservation } from '../../history/recordLaunchdObservation'
import { createHub } from '../../hub/createHub'
import { openAuthDb } from '../../test/openAuthDb'
import { openHistoryDb } from '../../test/openHistoryDb'
import type { LaunchdCatalog } from '../../types/LaunchdCatalog'
import { createApp } from '../createApp'

describe('launchd routes', () => {
  it('serves rows and history for registered labels only', async () => {
    const authDb = openAuthDb()
    const historyDb = openHistoryDb()
    recordLaunchdObservation(historyDb, {
      label: 'com.example.a',
      pid: 1,
      runs: 1,
      lastExit: null,
      at: Date.now(),
    })
    const clock = Date.now()
    const app = createApp({
      authDb,
      historyDb,
      hub: createHub({ ringSize: 2, recentEvents: 2, firstId: 1 }),
      worker: null,
      atrium: null,
      clips: null,
      brain: null,
      workerActivity: null,
      stageLabels: new Map(),
      catalog: {
        rows: vi.fn<LaunchdCatalog['rows']>().mockResolvedValue([
          {
            component: 'worker',
            label: 'com.example.a',
            role: 'keepalive',
            schedule: null,
          },
        ]),
      },
      guard: { port: 8790, allowedHosts: [], allowedLogins: [] },
      webRoot: '/nonexistent',
      now: () => clock,
    })
    const headers = {
      Host: '127.0.0.1:8790',
      'Sec-Fetch-Site': 'same-origin',
      Cookie: `__Host-orbit_session=${createSession(authDb, Date.now())}`,
    }
    const rows = await (
      await app.request('http://127.0.0.1:8790/api/launchd', { headers })
    ).json()
    expect(rows).toEqual({
      rows: [
        {
          component: 'worker',
          label: 'com.example.a',
          role: 'keepalive',
          schedule: null,
        },
      ],
    })
    const ok = await app.request(
      'http://127.0.0.1:8790/api/launchd/history?label=com.example.a&range=24h',
      { headers },
    )
    const body = await ok.json()
    expect(body).toHaveProperty('observations.length', 1)
    expect(body).toHaveProperty('now', clock)
    const unknown = await app.request(
      'http://127.0.0.1:8790/api/launchd/history?label=com.example.b&range=24h',
      { headers },
    )
    expect(unknown.status).toBe(404)
    const badRange = await app.request(
      'http://127.0.0.1:8790/api/launchd/history?label=com.example.a&range=1y',
      { headers },
    )
    expect(badRange.status).toBe(400)
  })
})
