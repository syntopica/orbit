import { verifyAdminToken } from '../../auth/verifyAdminToken'
import { collectIo } from '../../test/collectIo'
import { tempInstance } from '../../test/tempInstance'
import { openState } from '../openState'
import { tokenCommand } from './tokenCommand'

describe('tokenCommand', () => {
  it('creates a token, prints it once, and stores only its hash', async () => {
    const env = { SYNTOPICA_DATA: await tempInstance() }
    const { io, out, err } = collectIo(env)
    expect(await tokenCommand(['create'], io)).toBe(0)
    const token = out.find((line) => /^[\w-]{43}$/.test(line)) ?? ''
    expect(out.filter((line) => line.includes(token))).toHaveLength(1)
    expect(err).toEqual([])
    const state = await openState(env)
    expect(verifyAdminToken(state.authDb, token)).toBe(true)
    const stored = state.authDb.prepare('SELECT hash FROM admin_token').get()
    expect(JSON.stringify(stored)).not.toContain(token)
    state.close()
  })

  it('shows a second token once and retires the first', async () => {
    const env = { SYNTOPICA_DATA: await tempInstance() }
    const first = collectIo(env)
    await tokenCommand(['create'], first.io)
    const second = collectIo(env)
    await tokenCommand(['create'], second.io)
    expect(second.out.join('\n')).not.toContain(first.out[1] ?? 'missing')
  })

  it('prints usage for any other subcommand', async () => {
    const { io, out, err } = collectIo({})
    expect(await tokenCommand(['show'], io)).toBe(2)
    expect(err.join()).toContain('usage: orbit token create')
    expect(out).toEqual([])
  })
})
