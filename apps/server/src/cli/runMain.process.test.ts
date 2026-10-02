import { ProcessError } from '../process/ProcessError'
import { collectIo } from '../test/collectIo'
import { runCli } from './runCli'
import { runMain } from './runMain'

vi.mock(import('./runCli'), () => ({ runCli: vi.fn() }))

describe('runMain failures', () => {
  it('adds the reason code of a ProcessError, nothing else', async () => {
    vi.mocked(runCli).mockRejectedValue(new ProcessError('timeout'))
    const { io, err } = collectIo({})
    expect(await runMain(['doctor'], io)).toBe(1)
    expect(err).toEqual(['orbit: failed (timeout)'])
  })

  it('never prints the message of an unexpected error', async () => {
    vi.mocked(runCli).mockRejectedValue(new Error('token abc123 leaked'))
    const { io, err } = collectIo({})
    expect(await runMain(['doctor'], io)).toBe(1)
    expect(err).toEqual(['orbit: failed'])
  })
})
