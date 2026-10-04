import { describe, expect, it } from 'vitest'

import { runLocalSource } from './runLocalSource'

const source = { id: 'todo:x', kind: 'todo', name: 'x' } as const

describe('runLocalSource', () => {
  it('answers unavailable when the read fails', async () => {
    const result = await runLocalSource(() => {
      throw new Error('unreadable')
    }, source)
    expect(result.source.status).toBe('unavailable')
  })
  it('aborts a read that outlives its deadline', async () => {
    const result = await runLocalSource(
      async (signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(new Error('aborted'))
          })
        }),
      source,
      10,
    )
    expect(result.source.status).toBe('unavailable')
  })
})
