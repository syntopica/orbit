#!/usr/bin/env node
const status = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  total: 9,
  states: {
    pending: 3,
    'needs-claude': 1,
    'reconciliation-pending': 1,
    reconciled: 4,
  },
  oldestAt: {
    pending: '2026-10-01T00:00:00.000Z',
    'needs-claude': null,
    'reconciliation-pending': null,
  },
  intake: {
    days: [1, 3, 2].map((count, index) => ({
      day: new Date(Date.now() - (2 - index) * 86_400_000)
        .toISOString()
        .slice(0, 10),
      count,
    })),
    undated: 1,
  },
}
// Synthetic items only: digest ids, codes, a worker job and a page id.
const items = [
  {
    id: '0123456789abcdef',
    state: 'needs-claude',
    reason: 'routed_needs_claude',
    failure: { stage: 'synthesis', code: 'MODEL_ESCALATED' },
    stage: 'operator',
    capturedAt: '2026-09-30T00:00:00.000Z',
    lastTransitionAt: '2026-10-01T00:00:00.000Z',
    attempts: 2,
    lastRun: {
      startedAt: '2026-10-01T00:00:00.000Z',
      durationMs: 93000,
      outcome: 'escalated',
      model: 'worker:ollama/model-a',
      boundary: 'worker-inference',
      workerJobIds: ['job-example-1'],
      usage: null,
    },
    pages: [],
  },
  {
    id: '1123456789abcdef',
    state: 'pending',
    reason: 'no_ledger',
    failure: null,
    stage: 'synthesis',
    capturedAt: '2026-10-01T00:00:00.000Z',
    lastTransitionAt: null,
    attempts: 0,
    lastRun: null,
    pages: [],
  },
  {
    id: '2123456789abcdef',
    state: 'reconciled',
    reason: 'reconciled',
    failure: null,
    stage: 'done',
    capturedAt: '2026-09-29T00:00:00.000Z',
    lastTransitionAt: null,
    attempts: 1,
    lastRun: {
      startedAt: '2026-09-29T01:00:00.000Z',
      durationMs: 41000,
      outcome: 'synthesized',
      model: 'agy:model-b',
      boundary: 'agy',
      workerJobIds: [],
      usage: {
        inputTokens: 26728,
        outputTokens: 43,
        cachedInputTokens: 0,
        reasoningTokens: 42,
      },
    },
    pages: ['notes/c.md'],
  },
]
const docs = {
  'status --json': status,
  'status --json --items': { ...status, items },
  'doctor --json': {
    schemaVersion: 1,
    ok: true,
    checks: [{ name: 'paths', ok: true, code: 'ok' }],
  },
}
const doc = docs[process.argv.slice(2).join(' ')]
if (doc === undefined) process.exit(64)
process.stdout.write(JSON.stringify(doc))
