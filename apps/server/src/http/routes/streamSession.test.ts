import { listSessions } from '../../auth/listSessions'
import { revokeSessions } from '../../auth/revokeSessions'
import { buildTestApp } from '../../test/buildTestApp'

describe('GET /api/stream session check', () => {
  it('closes the stream at the next ping once the session is revoked', async () => {
    vi.useFakeTimers()
    try {
      let clock = 1_790_000_000_000
      const { get, authDb } = buildTestApp({ now: () => clock })
      const res = await get('/api/stream')
      const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
        res.body?.getReader()
      await reader?.read()
      revokeSessions(authDb, listSessions(authDb)[0]?.prefix ?? '')
      clock += 15_000
      await vi.advanceTimersByTimeAsync(300)
      expect((await reader?.read())?.done).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
})
