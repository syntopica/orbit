import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createCaptureAdapter } from './createCaptureAdapter'

const tokenFile = async () => {
  const path = join(await mkdtemp(join(tmpdir(), 'orbit-capture-')), 't')
  await writeFile(path, 'capture-token\n')
  return path
}
const reply =
  (body: unknown, status = 200): typeof fetch =>
  async () =>
    await Promise.resolve(new Response(JSON.stringify(body), { status }))
const adapterWith = async (fetchImpl: typeof fetch) =>
  createCaptureAdapter({
    url: 'https://capture.example',
    tokenFile: await tokenFile(),
    cadenceMs: 120_000,
    fetch: fetchImpl,
  })

describe('createCaptureAdapter', () => {
  it('reads the undrained count with a bearer token', async () => {
    let auth = ''
    const adapter = await adapterWith(async (input, init) => {
      auth = new Headers(init?.headers).get('Authorization') ?? ''
      expect(input).toBe('https://capture.example/api/captures/count')
      return await reply({
        data: {
          schemaVersion: 1,
          count: 2,
          oldestAt: '2026-10-01T00:00:00.000Z',
        },
      })(input, init)
    })
    const core = await adapter.read(new AbortController().signal)
    expect(auth).toBe('Bearer capture-token')
    expect(core.pending).toEqual([
      {
        key: 'capture.undrained',
        count: 2,
        oldestAt: '2026-10-01T00:00:00.000Z',
      },
    ])
    expect(adapter.freshnessMs).toBe(240_000)
  })
  it('maps a refused token to unauthorized', async () => {
    const adapter = await adapterWith(reply({}, 401))
    await expect(
      adapter.read(new AbortController().signal),
    ).rejects.toMatchObject({ reason: 'unauthorized' })
  })
  it('rejects an offset oldestAt as schema_invalid', async () => {
    const adapter = await adapterWith(
      reply({
        data: {
          schemaVersion: 1,
          count: 1,
          oldestAt: '2026-10-01T02:00:00+02:00',
        },
      }),
    )
    await expect(
      adapter.read(new AbortController().signal),
    ).rejects.toMatchObject({ reason: 'schema_invalid' })
  })
  it('rejects a non-ISO oldestAt as schema_invalid', async () => {
    const adapter = await adapterWith(
      reply({ data: { schemaVersion: 1, count: 1, oldestAt: 'yesterday' } }),
    )
    await expect(
      adapter.read(new AbortController().signal),
    ).rejects.toMatchObject({ reason: 'schema_invalid' })
  })
})
