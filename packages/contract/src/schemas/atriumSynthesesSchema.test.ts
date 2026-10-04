import { atriumPassesSchema } from './atriumPassesSchema'
import { atriumSynthesesSchema } from './atriumSynthesesSchema'
import { atriumSynthesisContentSchema } from './atriumSynthesisContentSchema'
import { synthesisJobKeySchema } from './synthesisJobKeySchema'

const row = {
  jobKey: 'a'.repeat(32),
  kind: 'episode',
  source: 'source-a',
  conversationId: 'c'.repeat(64),
  episodeId: 'e'.repeat(24),
  eventCount: 3,
  sessionSince: null,
  sessionUntil: null,
  authoredAt: 1_789_000_000_000,
  writtenAt: 1_789_999_000_000,
  modelRequested: 'local-model-a',
  modelResolved: 'model-a:7b',
  inputTokens: 1200,
  outputTokens: 300,
  durationMs: null,
  mapChunks: 1,
  workerResults: 1,
  facts: 2,
  openEnds: 0,
}
const pass = {
  lane: 'local',
  producer: 'local',
  model: 'model-a:7b',
  startedAt: 1_789_990_000_000,
  finishedAt: 1_789_993_300_000,
  durationMs: 3_300_000,
  exitCode: 124,
  state: 'timeout',
  synthesized: null,
  skipped: null,
  failed: null,
  deferred: null,
}

describe('atrium synthesis schemas', () => {
  it('accepts a syntheses view', () => {
    const view = {
      now: 1_790_000_000_000,
      records: 10,
      rows: [row],
      daily: [
        {
          day: 1_789_948_800_000,
          records: 1,
          inputTokens: 1200,
          outputTokens: 300,
        },
      ],
    }
    expect(atriumSynthesesSchema.parse(view)).toEqual(view)
  })
  it('rejects a row carrying content or a key that is not a registry key', () => {
    const view = { now: 1, records: 1, daily: [] }
    expect(
      atriumSynthesesSchema.parse({ ...view, rows: [{ ...row, title: 'x' }] })
        .rows[0],
    ).not.toHaveProperty('title')
    expect(() =>
      atriumSynthesesSchema.parse({
        ...view,
        rows: [{ ...row, jobKey: '../a' }],
      }),
    ).toThrow()
    expect(() =>
      atriumSynthesesSchema.parse({
        ...view,
        rows: [{ ...row, source: 'free text' }],
      }),
    ).toThrow()
  })
  it('accepts passes with a running pass and its progress', () => {
    const running = {
      ...pass,
      finishedAt: null,
      durationMs: null,
      exitCode: null,
      state: 'running',
    }
    const view = {
      now: 1_790_000_000_000,
      lastPass: running,
      unsuccessfulStreak: 3,
      progress: {
        conversations: 40,
        finished: 2,
        failed: 1,
        synthesized: 2,
        walled: false,
        updatedAt: 1_789_999_000_000,
      },
      passes: [running, pass],
    }
    expect(atriumPassesSchema.parse(view)).toEqual(view)
    expect(() =>
      atriumPassesSchema.parse({
        ...view,
        lastPass: { ...pass, state: 'odd' },
      }),
    ).toThrow()
  })
  it('accepts content and only 32-hex job keys', () => {
    const content = { title: 't', summary: 's', facts: ['f'], openEnds: [] }
    expect(atriumSynthesisContentSchema.parse(content)).toEqual(content)
    expect(synthesisJobKeySchema.safeParse('0'.repeat(32)).success).toBe(true)
    expect(synthesisJobKeySchema.safeParse('A'.repeat(32)).success).toBe(false)
    expect(synthesisJobKeySchema.safeParse('-'.repeat(32)).success).toBe(false)
  })
})
