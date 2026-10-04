import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { readFailureCount } from './readFailureCount'
import { writeFailureCount } from './writeFailureCount'

describe('failure count file', () => {
  it('reads a missing or garbled file as zero and round-trips a count', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-watch-'))
    const path = join(dir, 'watch-failures')
    try {
      expect(await readFailureCount(path)).toBe(0)
      await writeFile(path, 'garbage')
      expect(await readFailureCount(path)).toBe(0)
      await rm(path)
      await writeFailureCount(path, 3)
      expect(await readFailureCount(path)).toBe(3)
      expect(await readFile(path, 'utf8')).toBe('3\n')
      expect((await stat(path)).mode & 0o777).toBe(0o600)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
