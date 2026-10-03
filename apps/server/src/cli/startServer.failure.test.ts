import { openTestState } from '../test/openTestState'
import { webRootWithIndex } from '../test/webRootWithIndex'
import type { ListeningServer } from '../types/ListeningServer'
import { listenLoopback } from './listenLoopback'
import { startHistory } from './startHistory'
import { startServer } from './startServer'

const listening: ListeningServer[] = []

vi.mock(import('./listenLoopback'), async (importOriginal) => {
  const original = await importOriginal()
  return {
    listenLoopback: vi.fn(
      async (...args: Parameters<typeof original.listenLoopback>) => {
        const result = await original.listenLoopback(...args)
        listening.push(result)
        return result
      },
    ),
  }
})
vi.mock(import('./startHistory'), () => ({ startHistory: vi.fn() }))

describe('startServer failure after listening', () => {
  it('closes the server and the state before rethrowing', async () => {
    vi.mocked(startHistory).mockImplementation(() => {
      throw new Error('history failed')
    })
    const state = await openTestState({ synthetic: true })
    const bound = { ...state, config: { ...state.config, port: 0 } }
    await expect(
      startServer(bound, {
        webRoot: await webRootWithIndex(),
        signal: new AbortController().signal,
        engines: {},
      }),
    ).rejects.toThrow('history failed')
    expect(vi.mocked(listenLoopback)).toHaveBeenCalledOnce()
    expect(listening[0]?.server.listening).toBe(false)
    expect(state.authDb.isOpen).toBe(false)
    expect(state.historyDb.isOpen).toBe(false)
  })
})
