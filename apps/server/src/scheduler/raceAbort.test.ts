import { raceAbort } from './raceAbort'

describe('raceAbort', () => {
  it('resolves with the work and detaches the abort listener', async () => {
    const controller = new AbortController()
    const remove = vi.spyOn(controller.signal, 'removeEventListener')
    await expect(
      raceAbort(Promise.resolve(1), controller.signal),
    ).resolves.toBe(1)
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function))
  })

  it('rejects with the work error and detaches the abort listener', async () => {
    const controller = new AbortController()
    const remove = vi.spyOn(controller.signal, 'removeEventListener')
    await expect(
      raceAbort(Promise.reject(new Error('boom')), controller.signal),
    ).rejects.toThrow('boom')
    expect(remove).toHaveBeenCalledOnce()
  })

  it('rejects with timeout when aborted while the work is pending', async () => {
    const controller = new AbortController()
    const raced = raceAbort(
      new Promise<number>(() => undefined),
      controller.signal,
    )
    controller.abort()
    await expect(raced).rejects.toMatchObject({ reason: 'timeout' })
  })

  it('rejects at once when the signal is already aborted', async () => {
    const raced = raceAbort(
      new Promise<number>(() => undefined),
      AbortSignal.abort(),
    )
    await expect(raced).rejects.toMatchObject({ reason: 'timeout' })
  })
})
