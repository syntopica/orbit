import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
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

  it('stops at the workspace root', async () => {
    const outer = await mkdtemp(join(tmpdir(), 'orbit-outer-'))
    await mkdir(join(outer, 'launchd'))
    await writeFile(
      join(outer, 'launchd', 'com.syntopica.orbit.plist.template'),
      'stray',
    )
    const root = join(outer, 'repo')
    await mkdir(join(root, 'apps'), { recursive: true })
    await writeFile(join(root, 'pnpm-workspace.yaml'), '')
    expect(() => readPlistTemplate(join(root, 'apps'))).toThrow(
      'plist template not found',
    )
  })
})
