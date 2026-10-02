import { stat } from 'node:fs/promises'
import { join } from 'node:path'

import { createSession } from '../auth/createSession'
import { tempInstance } from '../test/tempInstance'
import { openState } from './openState'

describe('openState', () => {
  let previous = 0
  beforeEach(() => {
    // Set a permissive mask the test must see openState override.
    previous = process.umask(0o022)
  })
  afterEach(() => {
    process.umask(previous)
  })

  it('creates the database and its WAL side files as 0600', async () => {
    const state = await openState({ SYNTOPICA_DATA: await tempInstance() })
    createSession(state.authDb, Date.now())
    state.historyDb.exec('INSERT INTO runs (started, stopped) VALUES (1, 1)')
    const modes: string[] = []
    for (const file of ['auth', 'history']) {
      for (const suffix of ['', '-wal', '-shm']) {
        const path = join(state.stateDir, `${file}.sqlite3${suffix}`)
        modes.push(
          `${path.slice(-12)} ${((await stat(path)).mode & 0o777).toString(8)}`,
        )
      }
    }
    expect(modes.filter((mode) => !mode.endsWith(' 600'))).toEqual([])
    expect(modes).toHaveLength(6)
    state.close()
  })

  it('sets the process umask to 077 before it opens anything', async () => {
    const state = await openState({ SYNTOPICA_DATA: await tempInstance() })
    expect(process.umask(0o077)).toBe(0o077)
    state.close()
  })

  it('closes both databases', async () => {
    const state = await openState({ SYNTOPICA_DATA: await tempInstance() })
    state.close()
    expect(state.authDb.isOpen).toBe(false)
    expect(state.historyDb.isOpen).toBe(false)
  })

  it('refuses a missing SYNTOPICA_DATA', async () => {
    await expect(openState({})).rejects.toThrow('SYNTOPICA_DATA')
  })
})
