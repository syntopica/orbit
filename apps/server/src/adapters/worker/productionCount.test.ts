import { productionCount } from './productionCount'

const queue = {
  states: { queued: 5, failed: 4, running: 1 },
  oldest_queued_s: 10,
  done_1h: 0,
  wasted_1h_s: 0,
  sampling_failed: 3,
  sampling_queued: 4,
}

describe('productionCount', () => {
  it('leaves sampling jobs out of queued and failed', () => {
    expect(productionCount(queue, 'queued')).toBe(1)
    expect(productionCount(queue, 'failed')).toBe(1)
    expect(productionCount(queue, 'running')).toBe(1)
  })
  it('counts every job when the engine reports no sampling', () => {
    const plain = {
      ...queue,
      sampling_failed: undefined,
      sampling_queued: undefined,
    }
    expect(productionCount(plain, 'queued')).toBe(5)
    expect(productionCount(plain, 'failed')).toBe(4)
  })
})
