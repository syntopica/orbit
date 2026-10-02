import { workerStatusSchema } from './workerStatusSchema'

const base = { queues: {}, cooldowns: {}, recent_failures: [] }

describe('workerStatusSchema nodes', () => {
  it('drops unknown node fields instead of rejecting them', () => {
    const parsed = workerStatusSchema.parse({
      ...base,
      nodes: { 'node-a': { age_s: 1, future_field: 'x', unexpected: ['m'] } },
    })
    expect(parsed.nodes).toEqual({ 'node-a': { age_s: 1 } })
  })
  it('rejects a node without its report age or with a wrong type', () => {
    for (const node of [{}, { age_s: 1, on_ac: 'yes' }]) {
      expect(
        workerStatusSchema.safeParse({ ...base, nodes: { 'node-a': node } })
          .success,
      ).toBe(false)
    }
  })
})
