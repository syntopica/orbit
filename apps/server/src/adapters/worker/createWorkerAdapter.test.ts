import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createWorkerAdapter } from './createWorkerAdapter'

const body = { queues: {}, nodes: {}, cooldowns: {}, recent_failures: [] }
const signal = () => new AbortController().signal

const tokenFile = async (content = 'secret-token\n') => {
  const path = join(
    await mkdtemp(join(tmpdir(), 'orbit-worker-')),
    'admin.token',
  )
  await writeFile(path, content)
  return path
}

const adapterWith = async (
  fetcher: typeof fetch,
  token?: string,
  cadenceMs = 5000,
) =>
  createWorkerAdapter({
    url: 'http://127.0.0.1:8765',
    tokenFile: await tokenFile(token),
    cadenceMs,
    fetch: fetcher,
  })

const respond = (status: number) => async () =>
  await Promise.resolve(new Response('{}', { status }))
const reply = (text: string | null) => async () =>
  await Promise.resolve(new Response(text))
const okJson = async () => await Promise.resolve(Response.json(body))

describe('createWorkerAdapter', () => {
  it('sends the bearer token and parses the status', async () => {
    const seen: Headers[] = []
    const urls: string[] = []
    const adapter = await adapterWith(async (input, init) => {
      urls.push(typeof input === 'string' ? input : '')
      seen.push(new Headers(init?.headers))
      return await okJson()
    })
    const core = await adapter.read(signal())
    expect(seen[0]?.get('authorization')).toBe('Bearer secret-token')
    expect(urls[0]).toBe('http://127.0.0.1:8765/v1/status')
    expect(core.component).toBe('worker')
  })
  it('declares cadence, timeout and freshness', async () => {
    const adapter = await adapterWith(respond(200), undefined, 5000)
    expect([
      adapter.id,
      adapter.cadenceMs,
      adapter.timeoutMs,
      adapter.freshnessMs,
    ]).toEqual(['worker', 5000, 4000, 10_000])
    const slow = await adapterWith(respond(200), undefined, 2000)
    expect(slow.timeoutMs).toBe(2000)
  })
  it('passes the abort signal to fetch', async () => {
    let received: AbortSignal | null | undefined
    const adapter = await adapterWith(async (_input, init) => {
      received = init?.signal
      return await okJson()
    })
    const own = signal()
    await adapter.read(own)
    expect(received).toBe(own)
  })
  it('maps 401 and 403 to unauthorized and 500 to unreachable', async () => {
    for (const [status, reason] of [
      [401, 'unauthorized'],
      [403, 'unauthorized'],
      [500, 'unreachable'],
      [404, 'unreachable'],
    ] as const) {
      const adapter = await adapterWith(respond(status))
      await expect(adapter.read(signal())).rejects.toMatchObject({ reason })
    }
  })
  it('refuses an empty token without making a request', async () => {
    let calls = 0
    const adapter = await adapterWith(async () => {
      calls += 1
      return await okJson()
    }, ' \n')
    await expect(adapter.read(signal())).rejects.toMatchObject({
      reason: 'unauthorized',
    })
    expect(calls).toBe(0)
  })
  it('reports a missing token file without leaking its path', async () => {
    const adapter = createWorkerAdapter({
      url: 'http://127.0.0.1:8765',
      tokenFile: join(tmpdir(), 'orbit-no-such-dir', 'missing.token'),
      cadenceMs: 5000,
      fetch: respond(200),
    })
    const error = await adapter.read(signal()).catch((e: unknown) => e)
    expect(error).toMatchObject({ reason: 'not_found', message: 'not_found' })
  })
  it('rejects a body over 1 MiB', async () => {
    const huge = JSON.stringify({ ...body, pad: 'x'.repeat(1_048_576) })
    const adapter = await adapterWith(reply(huge))
    await expect(adapter.read(signal())).rejects.toMatchObject({
      reason: 'output_too_large',
    })
  })
  it('accepts a body just under the cap', async () => {
    const fits = JSON.stringify({ ...body, pad: 'x'.repeat(1_048_000) })
    const adapter = await adapterWith(reply(fits))
    await expect(adapter.read(signal())).resolves.toMatchObject({
      component: 'worker',
    })
  })
  it('accepts exactly 1 MiB and rejects one byte more', async () => {
    const sized = (bytes: number) => {
      const base = JSON.stringify({ ...body, pad: '' }).length
      return JSON.stringify({ ...body, pad: 'x'.repeat(bytes - base) })
    }
    const exact = await adapterWith(reply(sized(1_048_576)))
    await expect(exact.read(signal())).resolves.toMatchObject({
      component: 'worker',
    })
    const over = await adapterWith(reply(sized(1_048_577)))
    await expect(over.read(signal())).rejects.toMatchObject({
      reason: 'output_too_large',
    })
  })
  it('maps invalid JSON and wrong shapes to schema_invalid', async () => {
    for (const text of ['not json SECRET', '{"queues":1}', '']) {
      const adapter = await adapterWith(reply(text))
      const error = await adapter.read(signal()).catch((e: unknown) => e)
      expect(error).toMatchObject({
        reason: 'schema_invalid',
        message: 'schema_invalid',
      })
    }
    const nobody = await adapterWith(reply(null))
    await expect(nobody.read(signal())).rejects.toMatchObject({
      reason: 'schema_invalid',
    })
  })
  it('emits nothing on the first read, then only new failures and cooldowns', async () => {
    const status = (ids: string[], cooldowns: Record<string, number>) => ({
      ...body,
      cooldowns,
      recent_failures: ids.map((id) => ({
        id,
        queue: 'q.a',
        error: 'PRIVATE text',
        finished: 1,
      })),
    })
    const responses = [
      status(['j1'], { agy: 1 }),
      status(['j1', 'j2'], { agy: 1, cursor: 1 }),
      status(['j1', 'j2'], { agy: 1, cursor: 1 }),
    ]
    const adapter = await adapterWith(
      async () => await Promise.resolve(Response.json(responses.shift())),
    )
    expect((await adapter.read(signal())).events).toEqual([])
    const second = await adapter.read(signal())
    expect(second.events.map((e) => e.kind)).toEqual([
      'worker.job_failed',
      'worker.cooldown_started',
    ])
    expect(JSON.stringify(second)).not.toContain('PRIVATE')
    expect((await adapter.read(signal())).events).toEqual([])
  })
  it('never puts the token into the snapshot', async () => {
    const adapter = await adapterWith(okJson)
    expect(JSON.stringify(await adapter.read(signal()))).not.toContain(
      'secret-token',
    )
  })
  it('re-reads the token file on every call', async () => {
    const path = await tokenFile('first\n')
    const tokens: (string | null)[] = []
    const adapter = createWorkerAdapter({
      url: 'http://127.0.0.1:8765',
      tokenFile: path,
      cadenceMs: 5000,
      fetch: async (_input, init) => {
        tokens.push(new Headers(init?.headers).get('authorization'))
        return await okJson()
      },
    })
    await adapter.read(signal())
    await writeFile(path, 'second\n')
    await adapter.read(signal())
    expect(tokens).toEqual(['Bearer first', 'Bearer second'])
  })
})
