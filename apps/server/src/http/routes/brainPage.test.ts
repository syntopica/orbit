import { brainPageSchema } from '@orbit/contract'

import { buildTestApp } from '../../test/buildTestApp'
import type { BrainPageDocument } from '../../types/BrainPageDocument'
import type { BrainReaders } from '../../types/BrainReaders'

const found: BrainPageDocument = {
  schemaVersion: 1,
  id: 'notes/a',
  frontmatter: {
    title: 'A page',
    type: 'topic',
    updated: '2026-10-01',
    summary: 7,
    sources: ['https://example.com/x', 3],
    token: 'never forwarded',
  },
  body: '# A\n\nSee [[notes/b]].',
  truncated: false,
  links: {
    outbound: [
      { target: 'notes/b', exists: true },
      { target: 'bad target', exists: false },
    ],
    inbound: ['notes/c', '../x'],
  },
}
const pagePath = '/api/brain/page?id=notes/a'
const asked: string[] = []
const app = (page: BrainReaders['page']) =>
  buildTestApp({
    brain: {
      graph: async () => Promise.reject(new Error('unused')),
      related: async () => Promise.reject(new Error('unused')),
      checks: async () => Promise.reject(new Error('unused')),
      page,
    },
  })
const reading =
  (doc: BrainPageDocument): BrainReaders['page'] =>
  async (id) => {
    asked.push(id)
    return await Promise.resolve(doc)
  }

describe('GET /api/brain/page', () => {
  it('answers the fixed frontmatter fields, body and valid links', async () => {
    const res = await app(reading(found)).get(pagePath)
    expect(res.status).toBe(200)
    const body: unknown = await res.json()
    const page = brainPageSchema.parse(body)
    expect(page).toEqual({
      id: 'notes/a',
      title: 'A page',
      type: 'topic',
      updated: '2026-10-01',
      summary: null,
      sources: ['https://example.com/x'],
      body: '# A\n\nSee [[notes/b]].',
      truncated: false,
      outbound: [{ target: 'notes/b', exists: true }],
      inbound: ['notes/c'],
    })
    expect(JSON.stringify(body)).not.toContain('never forwarded')
  })
  it('caps multibyte bodies at 1 MiB and marks local truncation', async () => {
    const body = 'a'.repeat(1_048_575) + '😀tail'
    const res = await app(reading({ ...found, body })).get(
      '/api/brain/page?id=notes/a',
    )
    const page = brainPageSchema.parse(await res.json())
    expect(page.body).toBe('a'.repeat(1_048_575))
    expect(Buffer.byteLength(page.body, 'utf8')).toBeLessThanOrEqual(1_048_576)
    expect(page.truncated).toBe(true)
  })
  it('preserves engine truncation for bodies within the limit', async () => {
    const res = await app(reading({ ...found, truncated: true })).get(
      '/api/brain/page?id=notes/a',
    )
    expect(brainPageSchema.parse(await res.json()).truncated).toBe(true)
  })
  it('answers unavailable when the reader is unconfigured', async () => {
    const res = await buildTestApp().get(pagePath)
    expect([res.status, await res.json()]).toEqual([
      503,
      { error: 'unavailable' },
    ])
  })
  it('refuses an id outside the pattern before running anything', async () => {
    asked.length = 0
    for (const id of ['', '..%2Fx', 'notes%2F.env', 'notes%2F-rf']) {
      const res = await app(reading(found)).get(`/api/brain/page?id=${id}`)
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'bad_request' })
    }
    expect(asked).toEqual([])
  })
  it('maps engine errors to 404, 400 and a fixed 503', async () => {
    const missing = await app(
      reading({ schemaVersion: 1, error: 'page_not_found' }),
    ).get('/api/brain/page?id=notes/none')
    expect([missing.status, await missing.json()]).toEqual([
      404,
      { error: 'not_found' },
    ])
    const invalid = await app(
      reading({ schemaVersion: 1, error: 'invalid_page_id' }),
    ).get('/api/brain/page?id=other/a')
    expect(invalid.status).toBe(400)
    const failing = await app(async () =>
      Promise.reject(new Error('boom')),
    ).get(pagePath)
    expect([failing.status, await failing.json()]).toEqual([
      503,
      { error: 'unavailable' },
    ])
  })
})
