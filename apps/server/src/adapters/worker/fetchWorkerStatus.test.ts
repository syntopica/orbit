import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { fetchWorkerStatus } from './fetchWorkerStatus'

const tokenFile = async () => {
  const path = join(await mkdtemp(join(tmpdir(), 'orbit-worker-')), 'token')
  await writeFile(path, 'secret-token')
  return path
}

const depsWith = async (url: string, fetcher: typeof fetch) => ({
  url,
  tokenFile: await tokenFile(),
  cadenceMs: 5000,
  fetch: fetcher,
})

describe('fetchWorkerStatus', () => {
  it('joins a base URL with a trailing slash without doubling it', async () => {
    const urls: string[] = []
    const deps = await depsWith('http://127.0.0.1:8765/', async (input) => {
      urls.push(typeof input === 'string' ? input : '')
      return await Promise.resolve(new Response('{}', { status: 500 }))
    })
    await expect(
      fetchWorkerStatus(deps, new AbortController().signal),
    ).rejects.toThrow('unreachable')
    expect(urls).toEqual(['http://127.0.0.1:8765/v1/status'])
  })
  it('cancels the body of a refused response', async () => {
    let cancelled = false
    const stream = new ReadableStream({
      cancel: () => {
        cancelled = true
      },
    })
    const deps = await depsWith('http://127.0.0.1:8765', async () => {
      return await Promise.resolve(new Response(stream, { status: 403 }))
    })
    await expect(
      fetchWorkerStatus(deps, new AbortController().signal),
    ).rejects.toThrow('unauthorized')
    expect(cancelled).toBe(true)
  })
})
