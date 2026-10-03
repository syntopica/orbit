import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { atriumRefreshDocument } from '../../test/atriumRefreshDocument'

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
      JSON.stringify(
        atriumRefreshDocument({
          writtenAt,
          records: { total: 2, bySource: { 'source-a': 2 } },
          populations: [],
        }),
      ),
    )
    const core = await adapterIn(dir).read(signal())
    expect(core.component).toBe('atrium')
    expect(core.metrics[0]).toMatchObject({ key: 'atrium.records', value: 2 })
  })
  it('rethrows the abort instead of mapping it to check_failed', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    await writeFile(join(dir, 'refresh.json'), '{}')
    const controller = new AbortController()
    controller.abort()
    await expect(adapterIn(dir).read(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})
