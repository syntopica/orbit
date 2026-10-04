import type { WatchDeps } from '../types/WatchDeps'
import { runWatch } from './runWatch'

const deps = (answers: boolean, count: number, restarted = true) => {
  const state = { count, restarts: 0, lines: [] as string[] }
  const built: WatchDeps = {
    probe: async () => Promise.resolve(answers),
    restart: async () => {
      state.restarts += 1
      return Promise.resolve(restarted)
    },
    readCount: async () => Promise.resolve(state.count),
    writeCount: async (next) => {
      state.count = next
      return Promise.resolve()
    },
    log: (line) => state.lines.push(line),
  }
  return { built, state }
}

describe('runWatch', () => {
  it('clears the count while orbit answers', async () => {
    const { built, state } = deps(true, 1)
    expect(await runWatch(built)).toBe(0)
    expect(state).toEqual({ count: 0, restarts: 0, lines: [] })
  })
  it('waits for a second miss before restarting', async () => {
    const { built, state } = deps(false, 0)
    expect(await runWatch(built)).toBe(0)
    expect(state.count).toBe(1)
    expect(state.restarts).toBe(0)
    expect(state.lines).toEqual(['orbit-watch no answer (1 in a row)'])
  })
  it('restarts on the second miss and starts counting again', async () => {
    const { built, state } = deps(false, 1)
    expect(await runWatch(built)).toBe(1)
    expect(state.restarts).toBe(1)
    expect(state.count).toBe(0)
    expect(state.lines).toEqual([
      'orbit-watch no answer (2 in a row), restarted',
    ])
  })
  it('says when the restart itself failed', async () => {
    const { built, state } = deps(false, 1, false)
    await runWatch(built)
    expect(state.lines[0]).toContain('restart failed')
  })
})
