import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { engineTableSchema } from './engineTableSchema'
import { resolveEngines } from './resolveEngines'

const checkout = async () => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-engine-'))
  await mkdir(join(dir, 'bin'))
  await writeFile(join(dir, 'bin', 'tool'), '#!/bin/sh\n')
  await chmod(join(dir, 'bin', 'tool'), 0o755)
  return dir
}

const entry = { command: 'bin/tool', subcommands: [['lint', '--json']] }
const run = async () => await Promise.resolve({ code: 0, stdout: '' })

describe('resolveEngines', () => {
  it('builds runners for engines the instance names and reports the rest', async () => {
    const table = engineTableSchema.parse({ brain: entry, clips: entry })
    const result = await resolveEngines(
      table,
      { brain: { path: await checkout() } },
      run,
    )
    expect(Object.keys(result.runners)).toEqual(['brain'])
    expect(result.failed).toEqual(['clips'])
  })
  it('reports an engine whose command is not executable', async () => {
    const dir = await checkout()
    const table = engineTableSchema.parse({
      brain: { ...entry, command: 'bin/none' },
    })
    expect(await resolveEngines(table, { brain: { path: dir } }, run)).toEqual({
      runners: {},
      failed: ['brain'],
    })
  })
})
