import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { buildWorkerReader } from './buildWorkerReader'

describe('buildWorkerReader', () => {
  it('is null without a worker in the config', () => {
    expect(buildWorkerReader(undefined, fetch)).toBeNull()
  })
  it('reads the status with the token from the file', async () => {
    const tokenFile = join(await mkdtemp(join(tmpdir(), 'orbit-wr-')), 't')
    await writeFile(tokenFile, 'secret-token')
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        queues: {},
        nodes: {},
        cooldowns: {},
        recent_failures: [],
      }),
    )
    const read = buildWorkerReader(
      { url: 'http://127.0.0.1:8765', tokenFile },
      fetcher,
    )
    const status = await read?.(new AbortController().signal)
    expect(status?.queues).toEqual({})
    expect(
      new Headers(fetcher.mock.calls[0]?.[1]?.headers).get('authorization'),
    ).toBe('Bearer secret-token')
  })
})
