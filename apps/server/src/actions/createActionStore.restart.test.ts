import { createHub } from '../hub/createHub'
import { openHistoryDb } from '../test/openHistoryDb'
import { createActionStore } from './createActionStore'

const hub = () => createHub({ ringSize: 8, recentEvents: 8, firstId: 1 })

describe('createActionStore across a restart', () => {
  it('keeps finished runs and marks one left running as interrupted', async () => {
    const db = openHistoryDb()
    let now = 1000
    const first = createActionStore(hub(), () => now, db)
    first.start({
      kind: 'run',
      target: 'com.example.done',
      component: 'launchd',
      key: 'done',
      run: async () => Promise.resolve({ code: 0, stdout: '' }),
    })
    await vi.waitFor(() => {
      expect(first.list()[0]?.state).toBe('succeeded')
    })
    now = 1500
    first.start({
      kind: 'restart',
      target: 'com.example.hung',
      component: 'launchd',
      key: 'hung',
      run: async () => new Promise(() => undefined),
    })
    const second = createActionStore(hub(), () => 2000, db)
    expect(second.list().map((run) => [run.target, run.state])).toEqual([
      ['com.example.hung', 'interrupted'],
      ['com.example.done', 'succeeded'],
    ])
  })
  it('keeps only the newest 50 rows', async () => {
    const db = openHistoryDb()
    let now = 0
    const store = createActionStore(hub(), () => now, db)
    for (let index = 0; index < 55; index += 1) {
      store.start({
        kind: 'run',
        target: `job-${String(index)}`,
        component: 'launchd',
        key: `job-${String(index)}`,
        run: async () => Promise.resolve({ code: 0, stdout: '' }),
      })
      now += 1
    }
    await vi.waitFor(() => {
      expect(store.list().every((run) => run.state === 'succeeded')).toBe(true)
    })
    const reopened = createActionStore(hub(), () => now, db)
    expect(reopened.list()).toHaveLength(50)
    expect(reopened.list()[0]?.target).toBe('job-54')
  })
})
