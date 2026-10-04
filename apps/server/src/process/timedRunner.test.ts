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
      () => clock,
    )
    const first = run(request(['page', '--id', 'secret/page']))
    const second = run(request(['graph']))
    release[0]?.()
    await first
    release[1]?.()
    await second
    expect(lines).toEqual([
      'engine-run brain page 250ms exit 0 concurrent=1',
      'engine-run brain graph 500ms exit 0 concurrent=2',
    ])
    expect(lines.join(' ')).not.toContain('secret')
  })

  it('logs the reason of a failed command and rethrows', async () => {
    const lines: string[] = []
    const run = timedRunner(
      async () => Promise.reject(new ProcessError('timeout')),
      (line) => lines.push(line),
      () => 0,
    )
    await expect(run(request([]))).rejects.toThrow('timeout')
    const other = timedRunner(
      async () => Promise.reject(new Error('boom')),
      (line) => lines.push(line),
      () => 0,
    )
    await expect(other(request(['status']))).rejects.toThrow('boom')
    expect(lines).toEqual([
      'engine-run brain - 0ms timeout concurrent=1',
      'engine-run brain status 0ms error concurrent=1',
    ])
  })
})
