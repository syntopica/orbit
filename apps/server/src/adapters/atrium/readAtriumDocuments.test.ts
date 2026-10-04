import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { atriumDoctorDocument } from '../../test/atriumDoctorDocument'
import { atriumRefreshDocument } from '../../test/atriumRefreshDocument'
import { atriumSynthesisDocument } from '../../test/atriumSynthesisDocument'
import { readAtriumDocuments } from './readAtriumDocuments'

const signal = () => new AbortController().signal

describe('readAtriumDocuments', () => {
  it('reads both documents and tolerates a missing synthesis file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await writeFile(
      join(dir, 'refresh.json'),
      JSON.stringify(atriumRefreshDocument()),
    )
    expect((await readAtriumDocuments(dir, signal())).synthesis).toBeNull()
    await writeFile(
      join(dir, 'synthesis.json'),
      JSON.stringify(atriumSynthesisDocument()),
    )
    const docs = await readAtriumDocuments(dir, signal())
    expect(docs.refresh.records.bySource).toEqual({
      'source-a': 40,
      'source-b': 10,
    })
    expect(docs.synthesis?.lastPass.synthesized).toBe(6)
  })
  it('reads an optional doctor document and refuses another major', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await writeFile(
      join(dir, 'refresh.json'),
      JSON.stringify(atriumRefreshDocument()),
    )
    expect((await readAtriumDocuments(dir, signal())).doctor).toBeNull()
    await writeFile(
      join(dir, 'doctor.json'),
      JSON.stringify(atriumDoctorDocument()),
    )
    const docs = await readAtriumDocuments(dir, signal())
    expect(docs.doctor?.checks.map((c) => c.severity)).toEqual([
      'ok',
      'warn',
      'broken',
    ])
    await writeFile(join(dir, 'doctor.json'), '{"schemaVersion":2}')
    await expect(readAtriumDocuments(dir, signal())).rejects.toMatchObject({
      reason: 'engine_schema_unsupported',
    })
  })
  it('reads not_found without refresh.json and schema_invalid when partial', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await expect(readAtriumDocuments(dir, signal())).rejects.toMatchObject({
      reason: 'not_found',
    })
    await writeFile(
      join(dir, 'refresh.json'),
      JSON.stringify({ ...atriumRefreshDocument(), archive: undefined }),
    )
    await expect(readAtriumDocuments(dir, signal())).rejects.toMatchObject({
      reason: 'schema_invalid',
    })
  })
})
