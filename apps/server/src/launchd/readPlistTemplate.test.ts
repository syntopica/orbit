import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { readPlistTemplate } from './readPlistTemplate'

describe('readPlistTemplate', () => {
  it('finds the template by walking up from a nested folder', () => {
    expect(readPlistTemplate(import.meta.dirname)).toContain('<key>Umask</key>')
  })

  it('throws a fixed error when no ancestor holds it', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-notemplate-'))
    expect(() => readPlistTemplate(dir)).toThrow('plist template not found')
  })
})
