import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { readJsonFile } from './readJsonFile'

describe('readJsonFile', () => {
  it('returns undefined when the file is absent', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-json-'))
    expect(await readJsonFile(join(dir, 'missing.json'))).toBeUndefined()
  })
  it('parses an existing file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-json-'))
    await writeFile(join(dir, 'a.json'), '{"a":1}')
    expect(await readJsonFile(join(dir, 'a.json'))).toEqual({ a: 1 })
  })
  it('reports malformed JSON without quoting the content', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-json-'))
    const path = join(dir, 'bad.json')
    await writeFile(path, '{"secret-value"')
    const error: unknown = await readJsonFile(path).catch(
      (caught: unknown) => caught,
    )
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(`invalid JSON in ${path}`)
  })
})
