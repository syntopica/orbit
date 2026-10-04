import { createServer } from 'node:net'

import { startTestServer } from '../test/startTestServer'

const freePort = async (): Promise<number> =>
  new Promise((resolve) => {
    const probe = createServer()
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address()
      const port = typeof address === 'object' && address ? address.port : 0
      probe.close(() => {
        resolve(port)
      })
    })
  })

describe('startServer remote port', () => {
  it('serves the same application on the remote port and stops both', async () => {
    const remotePort = await freePort()
    const { controller } = await startTestServer({ remotePort })
    const url = `http://127.0.0.1:${String(remotePort)}/api/snapshots`
    const res = await fetch(url, {
      headers: {
        Host: 'orbit.example.ts.net',
        'Sec-Fetch-Site': 'same-origin',
      },
    })
    expect(res.status).toBe(421)
    controller.abort()
    await vi.waitFor(async () => {
      await expect(fetch(url)).rejects.toThrow()
    })
  })
})
