import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { buildWorkerActivityReader } from './buildWorkerActivityReader'

const config = async () => {
  const tokenFile = join(await mkdtemp(join(tmpdir(), 'orbit-wa-')), 't')
  await writeFile(tokenFile, 'secret-token')
  return { url: 'http://127.0.0.1:8765', tokenFile }
}

describe('buildWorkerActivityReader', () => {
  it('is null without a worker in the config', () => {
    expect(buildWorkerActivityReader(undefined, fetch)).toBeNull()
  })
  it('reads the activity for the asked hours with the token', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ since: 1, bucket_s: 3600, rows: [] }))
    const read = buildWorkerActivityReader(await config(), fetcher)
    const report = await read?.(168, new AbortController().signal)
    expect(report).toEqual({ since: 1, bucket_s: 3600, rows: [] })
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      'http://127.0.0.1:8765/v1/activity?hours=168',
    )
    expect(
      new Headers(fetcher.mock.calls[0]?.[1]?.headers).get('authorization'),
    ).toBe('Bearer secret-token')
  })
  it('refuses a body of the wrong shape', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{"since":"x"}'))
    const read = buildWorkerActivityReader(await config(), fetcher)
    await expect(read?.(24, new AbortController().signal)).rejects.toThrow(
      'schema_invalid',
    )
  })
})
