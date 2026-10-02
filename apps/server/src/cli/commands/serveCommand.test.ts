import { collectIo } from '../../test/collectIo'
import { tempInstance } from '../../test/tempInstance'
import { startServer } from '../startServer'
import { serveCommand } from './serveCommand'

vi.mock('../startServer', () => ({ startServer: vi.fn() }))

type Handler = () => void

// Captures the signal handlers serve registers, so the test can invoke them
// without raising a real signal in the test runner.
const captureSignals = (): Map<string, Handler> => {
  const handlers = new Map<string, Handler>()
  vi.spyOn(process, 'once').mockImplementation(((event: string, h: Handler) => {
    handlers.set(event, h)
    return process
  }) as never)
  return handlers
}

describe('serveCommand', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.mocked(startServer).mockReset()
  })

  it('announces the port, then aborts the server on SIGTERM and exits 0', async () => {
    vi.mocked(startServer).mockResolvedValue({ port: 8790 })
    const handlers = captureSignals()
    const { io, out } = collectIo({ SYNTOPICA_DATA: await tempInstance() })
    const done = serveCommand([], io)
    await vi.waitFor(() => {
      expect(handlers.has('SIGTERM')).toBe(true)
    })
    expect(out).toEqual(['orbit listening on http://127.0.0.1:8790'])
    const options = vi.mocked(startServer).mock.calls[0]?.[1]
    expect(options?.signal.aborted).toBe(false)
    expect(options?.webRoot.endsWith('/public')).toBe(true)
    handlers.get('SIGTERM')?.()
    expect(await done).toBe(0)
    expect(options?.signal.aborted).toBe(true)
  })

  it('also stops on SIGINT', async () => {
    vi.mocked(startServer).mockResolvedValue({ port: 8790 })
    const handlers = captureSignals()
    const { io } = collectIo({ SYNTOPICA_DATA: await tempInstance() })
    const done = serveCommand([], io)
    await vi.waitFor(() => {
      expect(handlers.has('SIGINT')).toBe(true)
    })
    handlers.get('SIGINT')?.()
    expect(await done).toBe(0)
  })

  it('reports a start failure with its message, closes the state and exits 1', async () => {
    vi.mocked(startServer).mockRejectedValue(new Error('fixed failure'))
    const { io, err, out } = collectIo({ SYNTOPICA_DATA: await tempInstance() })
    expect(await serveCommand([], io)).toBe(1)
    expect(err).toEqual(['fixed failure'])
    expect(out).toEqual([])
    const state = vi.mocked(startServer).mock.calls[0]?.[0]
    expect(state?.authDb.isOpen).toBe(false)
  })

  it('falls back to a fixed message for a non-error rejection', async () => {
    vi.mocked(startServer).mockRejectedValue('boom')
    const { io, err } = collectIo({ SYNTOPICA_DATA: await tempInstance() })
    expect(await serveCommand([], io)).toBe(1)
    expect(err).toEqual(['orbit could not start'])
  })

  it('--print-plist prints the rendered plist and exits 0 without starting', async () => {
    const { io, out } = collectIo({ SYNTOPICA_DATA: '/srv/instance' })
    expect(await serveCommand(['--print-plist'], io)).toBe(0)
    const text = out.join('\n')
    expect(text).toContain('<string>/srv/instance</string>')
    expect(text).toContain(`<string>${process.execPath}</string>`)
    expect(text).toContain('<integer>63</integer>')
    expect(text).not.toContain('__')
    expect(startServer).not.toHaveBeenCalled()
  })

  it('--print-plist without SYNTOPICA_DATA reports it and exits 1', async () => {
    const { io, err, out } = collectIo({})
    expect(await serveCommand(['--print-plist'], io)).toBe(1)
    expect(err).toEqual([
      'orbit: set SYNTOPICA_DATA to the absolute path of the instance',
    ])
    expect(out).toEqual([])
  })
})
