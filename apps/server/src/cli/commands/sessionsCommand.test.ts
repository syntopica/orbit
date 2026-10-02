import { createSession } from '../../auth/createSession'
import { listSessions } from '../../auth/listSessions'
import { collectIo } from '../../test/collectIo'
import { tempInstance } from '../../test/tempInstance'
import { openState } from '../openState'
import { sessionsCommand } from './sessionsCommand'

describe('sessionsCommand', () => {
  it('lists and revokes sessions by prefix', async () => {
    const env = { SYNTOPICA_DATA: await tempInstance() }
    const state = await openState(env)
    const id = createSession(state.authDb, Date.now())
    state.close()
    const { io, out } = collectIo(env)
    expect(await sessionsCommand(['list'], io)).toBe(0)
    const prefix = out.at(-1)?.split(/\s+/)[0] ?? ''
    expect(prefix).toMatch(/^[0-9a-f]{8}$/)
    expect(out.join('\n')).not.toContain(id)
    expect(await sessionsCommand(['revoke', prefix], io)).toBe(0)
    expect(out.at(-1)).toBe('revoked 1')
  })

  it('refuses a short prefix with a fixed message and a failing exit', async () => {
    const { io, out, err } = collectIo({ SYNTOPICA_DATA: await tempInstance() })
    expect(await sessionsCommand(['revoke', 'abc'], io)).toBe(1)
    expect(err).toEqual([
      'refused: the prefix must be at least 8 hex characters',
    ])
    expect(out).toEqual([])
  })

  it('refuses a non-hex prefix without echoing it', async () => {
    const { io, err } = collectIo({ SYNTOPICA_DATA: await tempInstance() })
    expect(await sessionsCommand(['revoke', 'zzzzzzzzzz'], io)).toBe(1)
    expect(err.join()).not.toContain('zzzz')
  })

  it('prints usage for anything else, and when the prefix is missing', async () => {
    const { io, err } = collectIo({ SYNTOPICA_DATA: await tempInstance() })
    expect(await sessionsCommand([], io)).toBe(2)
    expect(await sessionsCommand(['revoke'], io)).toBe(2)
    expect(err).toHaveLength(2)
  })

  it('answers a database failure with a fixed line, not the prefix message', async () => {
    const env = { SYNTOPICA_DATA: await tempInstance() }
    const state = await openState(env)
    createSession(state.authDb, Date.now())
    const prefix = listSessions(state.authDb)[0]?.prefix ?? ''
    state.authDb.exec(
      "CREATE TRIGGER no_delete BEFORE DELETE ON sessions BEGIN SELECT RAISE(ABORT, 'locked'); END",
    )
    state.close()
    const { io, err } = collectIo(env)
    expect(await sessionsCommand(['revoke', prefix], io)).toBe(1)
    expect(err).toEqual(['orbit: failed'])
  })
})
