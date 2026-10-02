import { createDetailPool } from './createDetailPool'

const timeout = { reason: 'timeout' }

describe('createDetailPool', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('runs two at a time in arrival order and times out from enqueue', async () => {
    const pool = createDetailPool(2)
    let active = 0
    let maxActive = 0
    const order: number[] = []
    const job = (n: number, ms: number) => async () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      order.push(n)
      await new Promise((resolve) => setTimeout(resolve, ms))
      active -= 1
      return n
    }
    const results = [
      pool.run(job(1, 1000), 5000),
      pool.run(job(2, 1000), 5000),
      pool.run(job(3, 10), 5000),
    ]
    const late = Promise.allSettled([pool.run(job(4, 10), 500)])
    await vi.advanceTimersByTimeAsync(2000)
    expect(await Promise.all(results)).toEqual([1, 2, 3])
    expect(order).toEqual([1, 2, 3])
    expect(maxActive).toBe(2)
    expect(await late).toMatchObject([{ status: 'rejected', reason: timeout }])
  })

  it('answers at the deadline but keeps the slot until a stuck job settles', async () => {
    const pool = createDetailPool(1)
    const gate = Promise.withResolvers<string>()
    const stuck = Promise.allSettled([
      pool.run(async () => await gate.promise, 100),
    ])
    const next = vi.fn<() => Promise<string>>().mockResolvedValue('ran')
    const queued = pool.run(next, 10_000)
    await vi.advanceTimersByTimeAsync(200)
    expect(await stuck).toMatchObject([{ status: 'rejected', reason: timeout }])
    expect(next).not.toHaveBeenCalled()
    gate.resolve('late')
    await vi.advanceTimersByTimeAsync(0)
    expect(await queued).toBe('ran')
  })

  it('frees the slot when a job throws synchronously', async () => {
    const pool = createDetailPool(1)
    const throwing = (): never => {
      throw new Error('boom')
    }
    await expect(pool.run(throwing, 1000)).rejects.toThrow('boom')
    const next = vi.fn<() => Promise<string>>().mockResolvedValue('next')
    expect(await pool.run(next, 1000)).toBe('next')
  })
})
