import { createKeyedTtlCache } from './createKeyedTtlCache'

describe('createKeyedTtlCache', () => {
  it('caches per key for its ttl and shares a load in flight', async () => {
    let clock = 0
    const cache = createKeyedTtlCache<string>(1000, () => clock, 2)
    const load = vi.fn(async (value: string) => Promise.resolve(value))
    await Promise.all([
      cache('a', async () => load('A')),
      cache('a', async () => load('A')),
    ])
    expect(load).toHaveBeenCalledTimes(1)
    expect(await cache('b', async () => load('B'))).toBe('B')
    clock = 999
    expect(await cache('a', async () => load('A2'))).toBe('A')
    clock = 1000
    expect(await cache('a', async () => load('A3'))).toBe('A3')
  })
  it('evicts the oldest key past its limit and never caches a failure', async () => {
    const cache = createKeyedTtlCache<number>(60_000, () => 0, 2)
    await cache('a', async () => Promise.resolve(1))
    await cache('b', async () => Promise.resolve(2))
    await cache('c', async () => Promise.resolve(3))
    expect(await cache('a', async () => Promise.resolve(10))).toBe(10)
    await expect(
      cache('d', async () => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom')
    expect(await cache('d', async () => Promise.resolve(4))).toBe(4)
  })
})
