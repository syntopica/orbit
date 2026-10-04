import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { readTodoSource } from './readTodoSource'

describe('readTodoSource', () => {
  it('reports missing, oversized and empty sources without exposing content', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-pending-'))
    const missing = await readTodoSource(
      { name: 'missing', path: join(dir, 'none') },
      new AbortController().signal,
    )
    expect(missing.source).toMatchObject({ status: 'unreadable', count: 0 })
    const path = join(dir, 'TODO.md')
    await writeFile(path, 'a'.repeat(1_048_577))
    expect(
      (
        await readTodoSource(
          { name: 'large', path },
          new AbortController().signal,
        )
      ).source.status,
    ).toBe('too_large')
    await writeFile(path, '# Empty')
    expect(
      (
        await readTodoSource(
          { name: 'empty', path },
          new AbortController().signal,
        )
      ).source,
    ).toMatchObject({ status: 'ok', count: 0 })
  })
})
