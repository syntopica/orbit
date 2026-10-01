import { mkdtemp, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { ensureStateDir } from './ensureStateDir'

describe('ensureStateDir', () => {
  it('creates <data>/orbit with mode 0700', async () => {
    const data = await mkdtemp(join(tmpdir(), 'orbit-state-'))
    const dir = await ensureStateDir(data)
    expect(dir).toBe(join(data, 'orbit'))
    expect((await stat(dir)).mode & 0o777).toBe(0o700)
  })
})
