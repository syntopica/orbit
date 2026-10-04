import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { ProcessError } from '../../process/ProcessError'
import { atriumRefreshDocument } from '../../test/atriumRefreshDocument'
import type { AtriumPassDocument } from '../../types/AtriumPassDocument'
import type { AtriumPassesDocument } from '../../types/AtriumPassesDocument'
import { createAtriumAdapter } from './createAtriumAdapter'
import { synthesisPassHealth } from './synthesisPassHealth'

const ended = (
  state: AtriumPassDocument['state'],
  exitCode: number | null,
): AtriumPassDocument => ({
  lane: 'local',
  producer: 'local',
  model: null,
  startedAt: null,
  finishedAt: null,
  durationS: null,
  exitCode,
  state,
  synthesized: null,
  skipped: null,
  failed: null,
  deferred: null,
})
const doc = (...passes: AtriumPassDocument[]): AtriumPassesDocument => ({
  schemaVersion: 1,
  lastPass: passes[0] ?? null,
  unsuccessfulStreak: 0,
  progress: null,
  passes,
})

describe('synthesisPassHealth', () => {
  it('warns on the newest ended pass, looking past a running one', () => {
    expect(
      synthesisPassHealth(
        doc(ended('running', null), ended('timeout', 124), ended('ok', 0)),
      ),
    ).toEqual({ state: 'warn', reason: 'pass_timeout' })
    expect(synthesisPassHealth(doc(ended('killed', 137)))).toEqual({
      state: 'warn',
      reason: 'pass_timeout',
    })
    expect(synthesisPassHealth(doc(ended('failed', 1)))).toEqual({
      state: 'warn',
      reason: 'pass_failed',
    })
  })
  it('has no opinion after a good pass or without a log', () => {
    expect(
      synthesisPassHealth(doc(ended('ok', 0), ended('timeout', 124))),
    ).toBe(null)
    expect(synthesisPassHealth(doc(ended('interrupted', null)))).toBeNull()
    expect(synthesisPassHealth(null)).toBeNull()
  })
})

describe('createAtriumAdapter with passes', () => {
  const statusDir = async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-atrium-'))
    const writtenAt = new Date().toISOString()
    await writeFile(
      join(dir, 'refresh.json'),
      JSON.stringify(atriumRefreshDocument({ writtenAt, populations: [] })),
    )
    return dir
  }
  it('surfaces a timed-out last pass on the card', async () => {
    const adapter = createAtriumAdapter({
      statusDir: await statusDir(),
      refreshIntervalMs: 3_600_000,
      cadenceMs: 60_000,
      readPasses: async () => Promise.resolve(doc(ended('timeout', 124))),
    })
    const core = await adapter.read(new AbortController().signal)
    expect(core.health).toEqual({ state: 'warn', reason: 'pass_timeout' })
  })
  it('keeps the card on its status files when the pass log cannot be read', async () => {
    const adapter = createAtriumAdapter({
      statusDir: await statusDir(),
      refreshIntervalMs: 3_600_000,
      cadenceMs: 60_000,
      readPasses: async () => Promise.reject(new ProcessError('check_failed')),
    })
    const core = await adapter.read(new AbortController().signal)
    expect(core.health).toEqual({ state: 'ok', reason: null })
  })
})
