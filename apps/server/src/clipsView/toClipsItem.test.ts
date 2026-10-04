import { toClipsItem } from './toClipsItem'

const raw = {
  id: '0123456789abcdef',
  state: 'reconciled',
  reason: 'reconciled',
  failure: null,
  stage: 'done',
  capturedAt: '2026-10-01T00:00:00.000Z',
  lastTransitionAt: 'not a time',
  attempts: 1,
  lastRun: {
    startedAt: '2026-10-02T00:00:00.000Z',
    durationMs: 1_500,
    outcome: 'synthesized',
    model: 'agy:model-b',
    boundary: 'agy',
    workerJobIds: [],
    usage: {
      inputTokens: 100,
      outputTokens: 20,
      cachedInputTokens: 0,
      reasoningTokens: null,
    },
  },
  pages: ['index.md', 'topics/placeholder-page.md', '../escape.md'],
}

describe('toClipsItem', () => {
  it('maps times to epoch ms and ledger paths to page ids', () => {
    expect(toClipsItem(raw)).toMatchObject({
      capturedAt: Date.parse('2026-10-01T00:00:00.000Z'),
      lastTransitionAt: null,
      lastRun: {
        startedAt: Date.parse('2026-10-02T00:00:00.000Z'),
        usage: { inputTokens: 100, outputTokens: 20 },
      },
      pages: ['topics/placeholder-page'],
    })
  })
  it('drops an item whose id, code or shape is not what the contract allows', () => {
    expect(toClipsItem({ ...raw, id: '01KYFX6NFRDVW03ZFJXQ6W1VVG' })).toBeNull()
    expect(toClipsItem({ ...raw, reason: 'free text here' })).toBeNull()
    expect(toClipsItem({ ...raw, stage: 'elsewhere' })).toBeNull()
    expect(toClipsItem('not an object')).toBeNull()
  })
})
