import { collectIo } from '../test/collectIo'
import { tempInstance } from '../test/tempInstance'
import { runCli } from './runCli'

describe('runCli', () => {
  it('prints usage for an unknown command', async () => {
    const { io, err } = collectIo({})
    expect(await runCli(['nope'], io)).toBe(2)
    expect(err.join('\n')).toContain('usage: orbit')
  })

  it('prints usage when no command is given', async () => {
    const { io, err } = collectIo({})
    expect(await runCli([], io)).toBe(2)
    expect(err.join('\n')).toContain('usage: orbit')
  })

  it('does not dispatch inherited object keys as commands', async () => {
    const { io, err } = collectIo({})
    expect(await runCli(['constructor'], io)).toBe(2)
    expect(await runCli(['toString'], io)).toBe(2)
    expect(err).toHaveLength(2)
  })

  it('passes the remaining arguments to the command', async () => {
    const { io, out } = collectIo({ SYNTOPICA_DATA: await tempInstance() })
    expect(await runCli(['sessions', 'list'], io)).toBe(0)
    expect(out[0]).toContain('prefix')
  })
})
