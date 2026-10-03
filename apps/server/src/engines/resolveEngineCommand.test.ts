import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { resolveEngineCommand } from './resolveEngineCommand'

const checkout = async () => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-engine-'))
  await mkdir(join(dir, 'bin'))
  await writeFile(join(dir, 'bin', 'tool'), '#!/bin/sh\n')
  return dir
}

describe('resolveEngineCommand', () => {
  it('resolves a relative command inside the checkout', async () => {
    const dir = await checkout()
    await chmod(join(dir, 'bin', 'tool'), 0o755)
    expect(await resolveEngineCommand(dir, 'bin/tool')).toBe(
      join(dir, 'bin', 'tool'),
    )
  })
  it('keeps an absolute command', async () => {
    const dir = await checkout()
    await chmod(join(dir, 'bin', 'tool'), 0o755)
    const abs = join(dir, 'bin', 'tool')
    expect(await resolveEngineCommand('/elsewhere', abs)).toBe(abs)
  })
  it('reports a missing or non-executable command as not_found', async () => {
    const dir = await checkout()
    await expect(resolveEngineCommand(dir, 'bin/tool')).rejects.toMatchObject({
      reason: 'not_found',
    })
    await expect(resolveEngineCommand(dir, 'bin/none')).rejects.toMatchObject({
      reason: 'not_found',
    })
  })
})
