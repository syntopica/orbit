import { atriumContextSchema } from '@orbit/contract'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import { buildAtriumContextReader } from '../../cli/buildAtriumContextReader'
import { createEngineRunner } from '../../engines/createEngineRunner'
import { runProcess } from '../../process/runProcess'
import { buildTestApp } from '../../test/buildTestApp'
import { writeFakeBin } from '../../test/writeFakeBin'
import type { AtriumContextReader } from '../../types/AtriumContextReader'

const PATH = '/api/atrium/context'
const QUERY = 'private words $(touch pwned) --project /x'
const document = (schemaVersion: number) =>
  JSON.stringify({
    schemaVersion,
    query: QUERY,
    evidence: [
      {
        record_id: 'r1',
        text: 'curated evidence',
        score: 3.5,
        trust: 'curated',
        role: 'note',
        provider: 'brain',
        conversation_id: 'notes/a.md',
        note_path: 'notes/a.md',
        authored_at: null,
        truncated: false,
      },
      {
        text: 'history évidence',
        trust: 'history',
        role: 'assistant',
        provider: 'free text',
        conversation_id: '0123456789abcdef0123',
        note_path: null,
        authored_at: '2026-10-01T10:00:00+00:00',
        truncated: true,
      },
    ],
    freshness: { status: 'fresh', last_refresh: '2026-10-04T00:00:00Z' },
    warnings: ['lexical_budget_exhausted', 'not a code'],
    limit: 8,
    max_chars: 16_000,
    text_chars: 32,
  })
// A fake atrium that records its argv count and last argument, then prints.
const fakeAtrium = async (schemaVersion = 1) => {
  const bin = await writeFakeBin(
    'atrium',
    `printf '%s\\n' "$#" "$6" > "$ARGS_FILE"\ncat <<'JSON'\n${document(schemaVersion)}\nJSON`,
  )
  const argsFile = join(dirname(bin), 'args.txt')
  const run = createEngineRunner(
    {
      file: bin,
      subcommands: [['context', '--json', '--lane', 'words', '--', '{query}']],
      env: { ARGS_FILE: argsFile },
    },
    runProcess,
  )
  return { reader: buildAtriumContextReader(run, true), argsFile, bin }
}
const ask = async (reader: AtriumContextReader | null, body: unknown) => {
  const app = buildTestApp({ atriumContext: reader })
  return app.post(PATH, JSON.stringify(body), { Cookie: app.cookie })
}

describe('POST /api/atrium/context', () => {
  it('answers labelled blocks with sizes and passes the query as one argument', async () => {
    const { reader, argsFile, bin } = await fakeAtrium()
    const logs = [
      vi.spyOn(console, 'log'),
      vi.spyOn(console, 'error'),
      vi.spyOn(console, 'warn'),
      vi.spyOn(console, 'info'),
    ]
    const res = await ask(reader, { query: `  ${QUERY}  ` })
    expect(res.status).toBe(200)
    const view = atriumContextSchema.parse(await res.json())
    expect(view.blocks).toEqual([
      expect.objectContaining({
        rank: 1,
        trust: 'curated',
        notePath: 'notes/a.md',
        chars: 16,
        truncated: false,
      }),
      expect.objectContaining({
        trust: 'history',
        provider: null,
        conversationId: '0123456789ab',
        authoredAt: Date.parse('2026-10-01T10:00:00Z'),
        chars: 16,
        truncated: true,
      }),
    ])
    expect(view).toMatchObject({
      textChars: 32,
      limit: 8,
      maxChars: 16_000,
      warnings: ['lexical_budget_exhausted'],
      freshnessStatus: 'fresh',
    })
    expect(await readFile(argsFile, 'utf8')).toBe(`6\n${QUERY}\n`)
    await expect(readFile(join(dirname(bin), 'pwned'))).rejects.toThrow()
    for (const log of logs) expect(log).not.toHaveBeenCalled()
  })
  it('reports another schema major as engine_schema_unsupported', async () => {
    const { reader } = await fakeAtrium(2)
    const res = await ask(reader, { query: 'orbit' })
    expect([res.status, await res.json()]).toEqual([
      503,
      { error: 'engine_schema_unsupported' },
    ])
  })
  it('refuses a bad query before running anything', async () => {
    const read = vi.fn<AtriumContextReader>()
    for (const body of [
      {},
      { query: '' },
      { query: '   ' },
      { query: 'x'.repeat(501) },
      { query: 'a\u0000b' },
      { query: 'a\nb' },
      { query: 7 },
      { query: 'ok', extra: true },
    ]) {
      const res = await ask(read, body)
      expect([res.status, await res.json()]).toEqual([
        400,
        { error: 'bad_request' },
      ])
    }
    expect(read).not.toHaveBeenCalled()
  })
  it('requires a session and the CSRF header', async () => {
    const read = vi.fn<AtriumContextReader>()
    const app = buildTestApp({ atriumContext: read })
    const body = JSON.stringify({ query: 'orbit' })
    expect((await app.post(PATH, body)).status).toBe(401)
    const forged = await app.post(PATH, body, {
      Cookie: app.cookie,
      'X-Orbit': '0',
    })
    expect(forged.status).toBe(403)
    expect(read).not.toHaveBeenCalled()
  })
  it('answers a fixed 503 when unconfigured or failing, and rate limits', async () => {
    expect((await ask(null, { query: 'orbit' })).status).toBe(503)
    const failing = vi
      .fn<AtriumContextReader>()
      .mockRejectedValue(new Error('secret content'))
    const app = buildTestApp({ atriumContext: failing })
    const body = JSON.stringify({ query: 'orbit' })
    const statuses: number[] = []
    for (let i = 0; i < 11; i += 1)
      statuses.push((await app.post(PATH, body, { Cookie: app.cookie })).status)
    expect(statuses).toEqual([...Array.from({ length: 10 }, () => 503), 429])
    const res = await app.post(PATH, body, { Cookie: app.cookie })
    expect(await res.text()).toBe('{"error":"rate_limited"}')
  })
})
