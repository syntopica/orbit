import { createTtlCache } from './createTtlCache'

describe('createTtlCache', () => {
  it('serves a value for its ttl, shares a load in flight, and retries a failure', async () => {
    let clock = 0
    const cache = createTtlCache<number>(1000, () => clock)
    const load = vi.fn<() => Promise<number>>().mockResolvedValue(1)
    expect(await Promise.all([cache(load), cache(load)])).toEqual([1, 1])
    expect(load).toHaveBeenCalledTimes(1)
    clock = 999
    await cache(load)
    expect(load).toHaveBeenCalledTimes(1)
    clock = 1000
    load.mockRejectedValueOnce(new Error('boom'))
    await expect(cache(load)).rejects.toThrow('boom')
    expect(await cache(load)).toBe(1)
    expect(load).toHaveBeenCalledTimes(3)
  })
  it('retries a loader that throws before returning its promise', async () => {
    const cache = createTtlCache<number>(1000, () => 0)
    const load = vi
      .fn<() => Promise<number>>()
      .mockImplementationOnce(() => {
        throw new Error('sync')
      })
      .mockResolvedValue(2)
    await expect(cache(load)).rejects.toThrow('sync')
    expect(await cache(load)).toBe(2)
  })
})
