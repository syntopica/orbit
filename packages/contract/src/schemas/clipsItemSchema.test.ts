import { clipsItemSchema } from './clipsItemSchema'

const item = {
  id: '0123456789abcdef',
  state: 'pending',
  reason: 'no_ledger',
  failure: null,
  stage: 'synthesis',
  capturedAt: 1_789_000_000_000,
  lastTransitionAt: null,
  attempts: 2,
  lastRun: {
    startedAt: 1_789_100_000_000,
    durationMs: 93_000,
    outcome: 'escalated',
    model: 'worker:ollama/model-a:35b',
    boundary: 'worker-inference',
    workerJobIds: ['job-1'],
    usage: {
      inputTokens: 10,
      outputTokens: 2,
      cachedInputTokens: null,
      reasoningTokens: 1,
    },
  },
  pages: ['topics/placeholder-page'],
}

describe('clipsItemSchema', () => {
  it('accepts an item of codes, times and page ids', () => {
    expect(clipsItemSchema.parse(item)).toEqual(item)
  })
  it('rejects a clip id, a free-text reason and a page path that is not an id', () => {
    expect(() =>
      clipsItemSchema.parse({ ...item, id: '01KYFX6NFRDVW03ZFJXQ6W1VVG' }),
    ).toThrow()
    expect(() =>
      clipsItemSchema.parse({ ...item, reason: 'the model said no' }),
    ).toThrow()
    expect(() =>
      clipsItemSchema.parse({ ...item, pages: ['../outside.md'] }),
    ).toThrow()
  })
})
