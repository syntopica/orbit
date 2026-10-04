import type { AtriumPasses, AtriumSyntheses, AtriumView } from '@orbit/contract'

// A synthetic atrium: one timed-out pass, a running one, one record.
export const ATRIUM_SYNTHESIS_FIXTURE = (() => {
  const NOW = 1_790_000_000_000
  const KEY = 'a'.repeat(32)
  const TITLE = 'Synthesized title'
  const view: AtriumView = {
    now: NOW,
    writtenAt: NOW - 60_000,
    refreshIntervalMs: 3_600_000,
    records: { total: 1, bySource: [{ source: 'source-a', count: 1 }] },
    archiveAt: NOW,
    refreshAt: NOW,
    contentAt: NOW,
    populations: [],
    synthesis: null,
    doctor: null,
  }
  const timedOut = {
    lane: 'local',
    producer: 'local',
    model: 'model-a:7b',
    startedAt: NOW - 7_200_000,
    finishedAt: NOW - 3_900_000,
    durationMs: 3_300_000,
    exitCode: 124,
    state: 'timeout' as const,
    synthesized: null,
    skipped: null,
    failed: null,
    deferred: null,
  }
  const passes: AtriumPasses = {
    now: NOW,
    lastPass: {
      ...timedOut,
      startedAt: NOW - 600_000,
      finishedAt: null,
      durationMs: null,
      exitCode: null,
      state: 'running',
    },
    unsuccessfulStreak: 15,
    progress: {
      conversations: 52_427,
      finished: 1,
      failed: 4,
      synthesized: 0,
      walled: false,
      updatedAt: NOW,
    },
    passes: [timedOut],
  }
  const syntheses: AtriumSyntheses = {
    now: NOW,
    records: 76_095,
    rows: [
      {
        jobKey: KEY,
        kind: 'episode',
        source: 'source-a',
        conversationId: 'c'.repeat(64),
        episodeId: 'e'.repeat(24),
        eventCount: 6,
        sessionSince: null,
        sessionUntil: null,
        authoredAt: NOW - 86_400_000,
        writtenAt: NOW - 60_000,
        modelRequested: 'local-model-a',
        modelResolved: 'model-a:7b',
        inputTokens: 1449,
        outputTokens: 369,
        durationMs: null,
        mapChunks: 1,
        workerResults: 1,
        facts: 4,
        openEnds: 1,
      },
    ],
    daily: [
      {
        day: Date.parse('2026-09-21T00:00:00Z'),
        records: 866,
        inputTokens: 6_697_381,
        outputTokens: 2_702_577,
      },
    ],
  }
  const content = {
    title: TITLE,
    summary: 'What happened.',
    facts: ['fact one'],
    openEnds: ['open one'],
  }
  return { NOW, KEY, TITLE, view, passes, syntheses, content }
})()
