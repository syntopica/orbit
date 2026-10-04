import type {
  AtriumPass,
  AtriumPasses,
  AtriumSynthesisRow,
} from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { selectEndedPass } from '../selectors/selectEndedPass'
import { selectTokenColumns } from '../selectors/selectTokenColumns'
import { describeTokenColumn } from './describeTokenColumn'
import { formatPassProgress } from './formatPassProgress'
import { formatPassSummary } from './formatPassSummary'
import { formatSynthesisInput } from './formatSynthesisInput'
import { formatSynthesisResult } from './formatSynthesisResult'

const NOW = 1_790_000_000_000
const pass: AtriumPass = {
  lane: 'task',
  producer: 'task',
  model: null,
  startedAt: null,
  finishedAt: null,
  durationMs: null,
  exitCode: null,
  state: 'interrupted',
  synthesized: null,
  skipped: null,
  failed: null,
  deferred: null,
}
const row: AtriumSynthesisRow = {
  jobKey: 'a'.repeat(32),
  kind: 'session',
  source: 'source-a',
  conversationId: null,
  episodeId: null,
  eventCount: 0,
  sessionSince: null,
  sessionUntil: null,
  authoredAt: null,
  writtenAt: NOW,
  modelRequested: null,
  modelResolved: null,
  inputTokens: 0,
  outputTokens: 0,
  durationMs: null,
  mapChunks: null,
  workerResults: 0,
  facts: 1,
  openEnds: 2,
}
const passes = (over: Partial<AtriumPasses>): AtriumPasses => ({
  now: NOW,
  lastPass: null,
  unsuccessfulStreak: 0,
  progress: null,
  passes: [],
  ...over,
})

describe('synthesis formatters', () => {
  it('summarises a pass with only the parts it logged', () => {
    expect(formatPassSummary(pass, NOW)).toBe('task · no end logged')
    expect(
      formatPassSummary(
        {
          ...pass,
          model: 'model-a',
          exitCode: 0,
          state: 'ok',
          durationMs: 60_000,
          finishedAt: NOW - 120_000,
        },
        NOW,
      ),
    ).toBe('task · model-a · exit 0 (ok) · took 1m · 2m ago')
  })
  it('describes progress only while a pass runs', () => {
    expect(formatPassProgress(passes({}))).toBeNull()
    expect(
      formatPassProgress(passes({ lastPass: { ...pass, state: 'running' } })),
    ).toBe('running')
  })
  it('picks the newest pass that logged an exit', () => {
    expect(selectEndedPass(passes({ passes: [pass] }))).toBeNull()
    const ended = { ...pass, exitCode: 1, state: 'failed' as const }
    expect(selectEndedPass(passes({ passes: [pass, ended] }))).toBe(ended)
  })
  it('names the input of a session record and counts in the singular', () => {
    expect(formatSynthesisInput(row)).toBe('conversation — · session — to —')
    expect(
      formatSynthesisInput({ ...row, kind: 'episode', eventCount: 3 }),
    ).toBe('conversation — · episode — · 3 events')
    expect(formatSynthesisResult(row)).toBe('1 fact · 2 open ends')
  })
  it('stacks input under output per day and describes a column', () => {
    const [column] = selectTokenColumns([
      { day: 0, records: 1, inputTokens: 10, outputTokens: 5 },
    ])
    expect(column?.total).toBe(15)
    expect(column === undefined ? '' : describeTokenColumn(column)).toBe(
      '10 in · 5 out, 1970-01-01',
    )
    expect(
      describeTokenColumn({ start: 0, end: 1, segments: [], total: 0 }),
    ).toBe('0 in · 0 out, 1970-01-01')
  })
})
