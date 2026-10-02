import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { ProcessError } from '../../process/ProcessError'
import type { LaunchdObservation } from '../../types/LaunchdObservation'
import type { RunRequest } from '../../types/RunRequest'
import type { RunResult } from '../../types/RunResult'
import { createLaunchdAdapter } from './createLaunchdAdapter'

const fixture = (name: string) =>
  readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf8')
const GOOD = 'com.example.good'
const GARBAGE = 'garbage'
const RUNNING = 'running.txt'
const labels = [
  {
    component: 'worker' as const,
    label: GOOD,
    role: 'keepalive' as const,
    plist: '/a',
  },
  {
    component: 'atrium' as const,
    label: 'com.example.bad',
    role: 'scheduled' as const,
    plist: '/b',
  },
]
const make = (
  run: (request: RunRequest) => Promise<RunResult>,
  recorded: LaunchdObservation[] = [],
) =>
  createLaunchdAdapter({
    launchctl: '/bin/launchctl',
    plutil: '/usr/bin/plutil',
    uid: 501,
    cadenceMs: 10_000,
    labels,
    run,
    record: (o) => recorded.push(o),
  })
const isBad = (request: RunRequest) => request.args[1]?.endsWith('bad') === true
const metric = (
  core: { metrics: { key: string; value: unknown }[] },
  key: string,
) => core.metrics.find((m) => m.key === key)?.value

describe('createLaunchdAdapter label isolation', () => {
  it('keeps the other labels when one output is unparseable', async () => {
    const recorded: LaunchdObservation[] = []
    const adapter = make(
      async (r) =>
        await Promise.resolve(
          isBad(r)
            ? { code: 0, stdout: GARBAGE }
            : { code: 0, stdout: fixture(RUNNING) },
        ),
      recorded,
    )
    const core = await adapter.read(new AbortController().signal)
    expect([
      metric(core, 'launchd.jobs'),
      metric(core, 'launchd.running'),
      metric(core, 'launchd.failing'),
    ]).toEqual([2, 1, 1])
    expect(recorded.map((o) => o.label)).toEqual([GOOD])
  })

  it('treats an exit other than service-not-found as unreadable, not unloaded', async () => {
    const recorded: LaunchdObservation[] = []
    const adapter = make(
      async (r) =>
        await Promise.resolve(
          isBad(r)
            ? { code: 1, stdout: '' }
            : { code: 0, stdout: fixture(RUNNING) },
        ),
      recorded,
    )
    await adapter.read(new AbortController().signal)
    expect(recorded.map((o) => o.label)).toEqual([GOOD])
  })

  it('records a not-loaded label as an observation', async () => {
    const recorded: LaunchdObservation[] = []
    const adapter = make(
      async (r) =>
        await Promise.resolve(
          isBad(r)
            ? { code: 113, stdout: '' }
            : { code: 0, stdout: fixture(RUNNING) },
        ),
      recorded,
    )
    await adapter.read(new AbortController().signal)
    expect(recorded.map((o) => o.label)).toEqual([GOOD, 'com.example.bad'])
  })

  it('throws the first reason when every label fails', async () => {
    const adapter = make(
      async () => await Promise.resolve({ code: 0, stdout: GARBAGE }),
    )
    await expect(adapter.read(new AbortController().signal)).rejects.toThrow(
      'schema_invalid',
    )
  })

  it('maps an unexpected failure to check_failed', async () => {
    const adapter = make(async () => await Promise.reject(new Error('boom')))
    await expect(adapter.read(new AbortController().signal)).rejects.toThrow(
      'check_failed',
    )
  })

  it('propagates an abort immediately', async () => {
    const controller = new AbortController()
    let calls = 0
    const adapter = make(async () => {
      calls += 1
      controller.abort()
      return await Promise.reject(new ProcessError('timeout'))
    })
    await expect(adapter.read(controller.signal)).rejects.toThrow('timeout')
    expect(calls).toBe(1)
  })

  it('diffs the next good read against the last good reading', async () => {
    let step = 0
    const adapter = make(async (r) => {
      if (!isBad(r)) {
        step += 1
        if (step === 2) return await Promise.resolve({ code: 1, stdout: '' })
        return await Promise.resolve(
          step === 1
            ? { code: 0, stdout: fixture(RUNNING) }
            : { code: 0, stdout: fixture('scheduled.txt') },
        )
      }
      return await Promise.resolve({ code: 113, stdout: '' })
    })
    const signal = new AbortController().signal
    await adapter.read(signal)
    const unreadable = await adapter.read(signal)
    expect(unreadable.events).toEqual([])
    const third = await adapter.read(signal)
    expect(third.events.map((e) => e.kind)).toContain('launchd.stopped')
  })
})
