import { mkdtemp } from 'node:fs/promises'
import { request } from 'node:http'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { openTestState } from '../test/openTestState'
import { startTestServer } from '../test/startTestServer'
import { webRootWithIndex } from '../test/webRootWithIndex'
import { startServer } from './startServer'

const timers = (): number =>
  process.getActiveResourcesInfo().filter((name) => name === 'Timeout').length

describe('startServer', () => {
  it('serves on loopback and stops on abort', async () => {
    const { controller, port } = await startTestServer()
    const url = `http://127.0.0.1:${String(port)}/api/snapshots`
    const res = await fetch(url, {
      headers: { 'Sec-Fetch-Site': 'same-origin' },
    })
    expect(res.status).toBe(401)
    controller.abort()
    await vi.waitFor(async () => {
      await expect(fetch(url)).rejects.toThrow()
    })
  })

  it('guards the Host header with the port it really bound', async () => {
    const { controller, port } = await startTestServer()
    const hostStatus = async (host: string): Promise<number> =>
      new Promise((resolve, reject) => {
        const req = request(
          { host: '127.0.0.1', port, path: '/', headers: { Host: host } },
          (res) => {
            res.resume()
            resolve(res.statusCode ?? 0)
          },
        )
        req.on('error', reject)
        req.end()
      })
    expect(await hostStatus('attacker.example')).toBe(421)
    expect(await hostStatus(`127.0.0.1:${String(port)}`)).toBe(200)
    controller.abort()
  })

  it('closes both databases and leaves no timer behind after abort', async () => {
    const before = timers()
    const { state, controller } = await startTestServer({ synthetic: true })
    expect(state.authDb.isOpen).toBe(true)
    controller.abort()
    expect(state.authDb.isOpen).toBe(false)
    expect(state.historyDb.isOpen).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(timers()).toBeLessThanOrEqual(before)
  })

  it('stops at once when the signal is already aborted', async () => {
    const state = await openTestState()
    const controller = new AbortController()
    controller.abort()
    const webRoot = await webRootWithIndex()
    await startServer(
      { ...state, config: { ...state.config, port: 0 } },
      { webRoot, signal: controller.signal, engines: {} },
    )
    expect(state.authDb.isOpen).toBe(false)
  })

  it('records metrics from the adapters it runs', async () => {
    const { state, controller } = await startTestServer({ synthetic: true })
    await vi.waitFor(() => {
      const row = state.historyDb
        .prepare('SELECT count(*) AS n FROM metric_samples')
        .get() as { n: number }
      expect(row.n).toBeGreaterThan(0)
    })
    controller.abort()
  })

  it('rejects with a fixed message when the port is taken', async () => {
    const taken = createServer()
    await new Promise<void>((resolve) => taken.listen(0, '127.0.0.1', resolve))
    const address = taken.address()
    const port =
      typeof address === 'object' && address !== null ? address.port : 0
    const state = await openTestState()
    const controller = new AbortController()
    const webRoot = await webRootWithIndex()
    await expect(
      startServer(
        { ...state, config: { ...state.config, port } },
        { webRoot, signal: controller.signal, engines: {} },
      ),
    ).rejects.toThrow('orbit could not listen on the configured port')
    taken.close()
    state.close()
  })

  it('refuses a web root that is missing or has no index.html', async () => {
    const state = await openTestState()
    const signal = new AbortController().signal
    const bound = { ...state, config: { ...state.config, port: 0 } }
    await expect(
      startServer(bound, { webRoot: '/nonexistent/web', signal, engines: {} }),
    ).rejects.toThrow('web root is missing or has no index.html')
    const empty = await mkdtemp(join(tmpdir(), 'orbit-empty-'))
    await expect(
      startServer(bound, { webRoot: empty, signal, engines: {} }),
    ).rejects.toThrow('web root is missing or has no index.html')
    state.close()
  })
})
