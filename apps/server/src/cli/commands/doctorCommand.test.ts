import { collectIo } from '../../test/collectIo'
import { tempInstance } from '../../test/tempInstance'
import { doctorCommand } from './doctorCommand'
import { tokenCommand } from './tokenCommand'

describe('doctorCommand', () => {
  it('fails when no admin token exists and reports each check', async () => {
    const { io, out } = collectIo({ SYNTOPICA_DATA: await tempInstance() })
    expect(await doctorCommand([], io)).toBe(1)
    expect(
      out.some((l) => l.startsWith('fail') && l.includes('admin token')),
    ).toBe(true)
    expect(out.some((l) => l.startsWith('ok') && l.includes('instance'))).toBe(
      true,
    )
    expect(out).toHaveLength(9)
  })

  it('passes once a token exists, and never prints it', async () => {
    const env = { SYNTOPICA_DATA: await tempInstance() }
    const created = collectIo(env)
    await tokenCommand(['create'], created.io)
    const { io, out } = collectIo(env)
    expect(await doctorCommand([], io)).toBe(0)
    expect(out.join('\n')).not.toContain(created.out[1] ?? 'missing')
  })

  it('fails with a fixed line when the instance cannot be opened', async () => {
    const { io, out } = collectIo({})
    expect(await doctorCommand([], io)).toBe(1)
    expect(out).toEqual([
      'fail  instance  SYNTOPICA_DATA unreadable or orbit.json invalid',
    ])
  })
})
