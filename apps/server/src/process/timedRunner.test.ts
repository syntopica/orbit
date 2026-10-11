import { describe, expect, it } from 'vitest'

import { ProcessError } from './ProcessError'
import { timedRunner } from './timedRunner'

const request = (args: string[]) => ({
  file: '/opt/engines/bin/brain',
  args,
  env: {},
  timeoutMs: 1000,
  maxBytes: 1024,
})

describe('timedRunner', () => {
  it('logs duration, outcome and concurrency without later arguments', async () => {
    const lines: string[] = []
    let clock = 0
    const release: (() => void)[] = []
    const run = timedRunner(
      async () =>
        new Promise((resolve) => {
          release.push(() => {
            clock += 250
            resolve({ code: 0, stdout: '' })
          })
        }),
      (line) => lines.push(line),
      {
        now: () => clock,
        load: () => 42.25,
        wall: () => new Date('2026-10-11T19:00:00.000Z'),
      },
    )
    const first = run(request(['page', '--id', 'secret/page']))
    const second = run(request(['graph']))
    release[0]?.()
    await first
    release[1]?.()
    await second
    expect(lines).toEqual([
      'engine-run brain page 250ms exit 0 concurrent=1 load=42.3 at=2026-10-11T19:00:00.000Z',
      'engine-run brain graph 500ms exit 0 concurrent=2 load=42.3 at=2026-10-11T19:00:00.000Z',
    ])
    expect(lines.join(' ')).not.toContain('secret')
  })

  it('logs the reason of a failed command and rethrows', async () => {
    const lines: string[] = []
    const run = timedRunner(
      async () => Promise.reject(new ProcessError('timeout')),
      (line) => lines.push(line),
      { now: () => 0, load: () => 1, wall: () => new Date(0) },
    )
    await expect(run(request([]))).rejects.toThrow('timeout')
    const other = timedRunner(
      async () => Promise.reject(new Error('boom')),
      (line) => lines.push(line),
      { now: () => 0, load: () => 1, wall: () => new Date(0) },
    )
    await expect(other(request(['status']))).rejects.toThrow('boom')
    expect(lines).toEqual([
      'engine-run brain - 0ms timeout concurrent=1 load=1.0 at=1970-01-01T00:00:00.000Z',
      'engine-run brain status 0ms error concurrent=1 load=1.0 at=1970-01-01T00:00:00.000Z',
    ])
  })

  it('logs a run its caller abandoned as aborted, not as its own timeout', async () => {
    const lines: string[] = []
    const run = timedRunner(
      async () => Promise.reject(new ProcessError('timeout')),
      (line) => lines.push(line),
      { now: () => 0, load: () => 1, wall: () => new Date(0) },
    )
    const controller = new AbortController()
    controller.abort()
    await expect(
      run({ ...request(['synthesis']), signal: controller.signal }),
    ).rejects.toThrow('timeout')
    expect(lines).toEqual([
      'engine-run brain synthesis 0ms aborted concurrent=1 load=1.0 at=1970-01-01T00:00:00.000Z',
    ])
  })

  it('times with the real clock by default', async () => {
    const lines: string[] = []
    const run = timedRunner(
      async () => Promise.resolve({ code: 3, stdout: '' }),
      (line) => lines.push(line),
    )
    await run(request(['status']))
    expect(lines[0]).toMatch(
      /^engine-run brain status \d+ms exit 3 concurrent=1 load=\d+\.\d at=\d{4}-\d\d-\d\dT[\d:.]+Z$/u,
    )
  })
})
