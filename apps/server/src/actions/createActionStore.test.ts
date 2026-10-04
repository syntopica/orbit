import { eventSchema } from '@orbit/contract'

import { createHub } from '../hub/createHub'
import { openHistoryDb } from '../test/openHistoryDb'
import { createActionStore } from './createActionStore'

describe('createActionStore', () => {
  it('keeps the last 50 runs and publishes valid metadata only', async () => {
    const hub = createHub({ ringSize: 120, recentEvents: 120, firstId: 1 })
    let now = 1_790_000_000_000
    const store = createActionStore(hub, () => now, openHistoryDb())
    for (let index = 0; index < 51; index += 1) {
      const result = store.start({
        kind: 'refresh',
        target: 'brain',
        component: 'brain',
        key: 'brain:refresh',
        run: async () =>
          await Promise.resolve({
            code: index === 50 ? 1 : 0,
            stdout: 'PRIVATE',
          }),
      })
      expect(result).toHaveProperty('run')
      await vi.waitFor(() => {
        expect(store.list()[0]?.state).not.toBe('started')
      })
      now += 1000
    }
    expect(store.list()).toHaveLength(50)
    expect(store.list()[0]).toMatchObject({ state: 'failed', exitCode: 1 })
    const events = hub.recentEvents().map((message) => message.event)
    for (const event of events)
      expect(eventSchema.safeParse(event).success).toBe(true)
    expect(JSON.stringify(events)).not.toContain('PRIVATE')
  })
  it('refuses a second run and aborts active work on stop', async () => {
    const hub = createHub({ ringSize: 4, recentEvents: 4, firstId: 1 })
    const store = createActionStore(
      hub,
      () => 1_790_000_000_000,
      openHistoryDb(),
    )
    let signal: AbortSignal | undefined
    const first = store.start({
      kind: 'run',
      target: 'com.example.job',
      component: 'launchd',
      key: 'job',
      run: async (current) =>
        await new Promise((_resolve, reject) => {
          signal = current
          current.addEventListener('abort', () => {
            reject(new Error('stopped'))
          })
        }),
    })
    expect(first).toHaveProperty('run')
    expect(
      store.start({
        kind: 'run',
        target: 'com.example.job',
        component: 'launchd',
        key: 'job',
        run: async () => await Promise.resolve({ code: 0, stdout: '' }),
      }),
    ).toEqual({ startedAt: 1_790_000_000_000 })
    store.stop()
    expect(signal?.aborted).toBe(true)
    await vi.waitFor(() => {
      expect(store.list()[0]?.state).toBe('failed')
    })
    expect(store.list()[0]?.exitCode).toBe(-1)
  })
})
