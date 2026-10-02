import { describe, expect, it } from 'vitest'

import { workerNode } from '../test/workerNode'
import { workerQueue } from '../test/workerView'
import { groupFailures } from './groupFailures'
import { nodeState } from './nodeState'
import { splitQueues } from './splitQueues'

const failure = (id: string, queue: string, error: string | null) => ({
  id,
  queue,
  error,
  finishedAt: 1,
})

describe('groupFailures', () => {
  it('folds consecutive failures of one queue and error only', () => {
    const groups = groupFailures([
      failure('a', 'queue.a', 'timeout'),
      failure('b', 'queue.a', 'timeout'),
      failure('c', 'queue.a', 'timeout'),
      failure('d', 'queue.b', 'timeout'),
      failure('e', 'queue.b', null),
      failure('f', 'queue.b', null),
      failure('g', 'queue.a', 'timeout'),
    ])
    expect(groups.map((g) => [g.latest.id, g.count])).toEqual([
      ['a', 3],
      ['d', 1],
      ['e', 2],
      ['g', 1],
    ])
  })
  it('returns nothing for no failures', () => {
    expect(groupFailures([])).toEqual([])
  })
})

describe('splitQueues', () => {
  it('keeps queues with queued or failed work apart from idle ones', () => {
    const queues = [
      workerQueue({ name: 'q1', queued: 1 }),
      workerQueue({ name: 'q2', failed: 1 }),
      workerQueue({ name: 'q3', succeeded: 9, live: 1 }),
    ]
    const { active, idle } = splitQueues(queues)
    expect(active.map((q) => q.name)).toEqual(['q1', 'q2'])
    expect(idle.map((q) => q.name)).toEqual(['q3'])
  })
})

describe('nodeState', () => {
  it('is offline, blocked or ready', () => {
    expect(nodeState(workerNode({ reportAgeMs: 400_000 }))).toBe('offline')
    expect(nodeState(workerNode({ onAc: false }))).toBe('blocked')
    expect(nodeState(workerNode())).toBe('ready')
  })
})
