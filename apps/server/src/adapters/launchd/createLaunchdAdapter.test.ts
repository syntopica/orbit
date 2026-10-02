import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { LaunchdObservation } from '../../types/LaunchdObservation'
import type { RunRequest } from '../../types/RunRequest'
import { createLaunchdAdapter } from './createLaunchdAdapter'

const fixture = (name: string) =>
  readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf8')

describe('createLaunchdAdapter', () => {
  it('reads every registered label and records observations', async () => {
    const calls: RunRequest[] = []
    const recorded: LaunchdObservation[] = []
    const adapter = createLaunchdAdapter({
      launchctl: '/bin/launchctl',
      plutil: '/usr/bin/plutil',
      uid: 501,
      cadenceMs: 10_000,
      labels: [
        {
          component: 'worker',
          label: 'com.example.keepalive',
          role: 'keepalive',
          plist: '/a',
        },
        {
          component: 'atrium',
          label: 'com.example.missing',
          role: 'scheduled',
          plist: '/b',
        },
      ],
      run: async (request) => {
        calls.push(request)
        return await Promise.resolve(
          request.args[1]?.endsWith('keepalive') === true
            ? { code: 0, stdout: fixture('running.txt') }
            : { code: 113, stdout: '' },
        )
      },
      record: (observation) => recorded.push(observation),
    })
    const core = await adapter.read(new AbortController().signal)
    expect(calls.map((c) => c.args)).toEqual([
      ['print', 'gui/501/com.example.keepalive'],
      ['print', 'gui/501/com.example.missing'],
    ])
    expect(core.component).toBe('launchd')
    expect(core.metrics.find((m) => m.key === 'launchd.failing')?.value).toBe(1)
    expect(recorded.map((o) => [o.label, o.pid])).toEqual([
      ['com.example.keepalive', 5627],
      ['com.example.missing', null],
    ])
    expect([
      adapter.id,
      adapter.cadenceMs,
      adapter.timeoutMs,
      adapter.freshnessMs,
    ]).toEqual(['launchd', 10_000, 15_000, 20_000])
  })

  it('emits events when a job changes between reads', async () => {
    let text = fixture('scheduled.txt')
    const adapter = createLaunchdAdapter({
      launchctl: '/bin/launchctl',
      plutil: '/usr/bin/plutil',
      uid: 501,
      cadenceMs: 10_000,
      labels: [
        {
          component: 'worker',
          label: 'com.example.nightly',
          role: 'scheduled',
          plist: '/a',
        },
      ],
      run: async () => await Promise.resolve({ code: 0, stdout: text }),
      record: () => undefined,
    })
    const signal = new AbortController().signal
    expect((await adapter.read(signal)).events).toEqual([])
    text = fixture('failed.txt')
    expect((await adapter.read(signal)).events.map((e) => e.kind)).toEqual([
      'launchd.exit_changed',
    ])
  })
})
