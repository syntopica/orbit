import { ensureStateDir } from '../state/ensureStateDir'
import { openDatabase } from '../state/openDatabase'
import { tempInstance } from '../test/tempInstance'
import { openState } from './openState'

vi.mock(import('../state/ensureStateDir'), async (importOriginal) => {
  const original = await importOriginal()
  return { ensureStateDir: vi.fn(original.ensureStateDir) }
})
vi.mock(import('../state/openDatabase'), async (importOriginal) => {
  const original = await importOriginal()
  return { openDatabase: vi.fn(original.openDatabase) }
})

describe('openState order', () => {
  let previous = 0
  beforeEach(() => {
    previous = process.umask(0o022)
  })
  afterEach(() => {
    process.umask(previous)
    vi.restoreAllMocks()
  })

  it('sets umask 077 before the state directory or any database is touched', async () => {
    const umask = vi.spyOn(process, 'umask')
    const state = await openState({ SYNTOPICA_DATA: await tempInstance() })
    const call = umask.mock.calls.findIndex(([mask]) => mask === 0o077)
    const umaskAt = umask.mock.invocationCallOrder[call] ?? Infinity
    const stateDirAt = vi.mocked(ensureStateDir).mock.invocationCallOrder[0]
    const databaseAt = vi.mocked(openDatabase).mock.invocationCallOrder[0]
    expect(call).toBeGreaterThanOrEqual(0)
    expect(umaskAt).toBeLessThan(stateDirAt ?? 0)
    expect(umaskAt).toBeLessThan(databaseAt ?? 0)
    state.close()
  })
})
