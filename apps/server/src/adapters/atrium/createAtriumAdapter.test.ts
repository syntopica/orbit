import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createAtriumAdapter } from './createAtriumAdapter'

const signal = () => new AbortController().signal
const adapterIn = (statusDir: string) =>
  createAtriumAdapter({
    statusDir,
    refreshIntervalMs: 3_600_000,
    cadenceMs: 60_000,
  })

describe('createAtriumAdapter', () => {
  it('reports a missing refresh document as not_found', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await expect(adapterIn(dir).read(signal())).rejects.toMatchObject({
      reason: 'not_found',
    })
  })
  it('rejects another schema major and reads a valid pair', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await writeFile(join(dir, 'refresh.json'), '{"schemaVersion":2}')
    await expect(adapterIn(dir).read(signal())).rejects.toMatchObject({
      reason: 'engine_schema_unsupported',
    })
    const writtenAt = new Date().toISOString()
    await writeFile(
      join(dir, 'refresh.json'),
      JSON.stringify({
        schemaVersion: 1,
        writtenAt,
        records: { total: 2 },
        populations: [],
      }),
    )
    const core = await adapterIn(dir).read(signal())
    expect(core.component).toBe('atrium')
    expect(core.metrics[0]).toMatchObject({ key: 'atrium.records', value: 2 })
  })
})
