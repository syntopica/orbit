import { createSession } from '../auth/createSession'
import { startTestServer } from '../test/startTestServer'

const endsWithin = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  ms: number,
): Promise<boolean> => {
  const drain = async (): Promise<boolean> => {
    try {
      for (;;) if ((await reader.read()).done) return true
    } catch {
      return true
    }
  }
  const timeout = new Promise<boolean>((resolve) =>
    setTimeout(() => {
      resolve(false)
    }, ms),
  )
  return Promise.race([drain(), timeout])
}

describe('startServer shutdown with an open stream', () => {
  it('ends an authenticated SSE stream when the signal aborts', async () => {
    const { state, controller, port } = await startTestServer()
    const cookie = `__Host-orbit_session=${createSession(state.authDb, Date.now())}`
    const res = await fetch(`http://127.0.0.1:${String(port)}/api/stream`, {
      headers: { Cookie: cookie, 'Sec-Fetch-Site': 'same-origin' },
    })
    expect(res.status).toBe(200)
    const reader = res.body?.getReader()
    expect((await reader?.read())?.done).toBe(false)
    controller.abort()
    expect(reader === undefined || (await endsWithin(reader, 1000))).toBe(true)
  })
})
