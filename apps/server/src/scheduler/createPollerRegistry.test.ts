import { createPollerRegistry } from './createPollerRegistry'

describe('createPollerRegistry', () => {
  it('lists a tracked component that never ran', () => {
    const registry = createPollerRegistry()
    registry.tracker('brain')
    expect(registry.rows()).toEqual([
      {
        component: 'brain',
        running: false,
        lastAttemptAt: null,
        lastSuccessAt: null,
        lastDurationMs: null,
        failures: 0,
        nextAt: null,
      },
    ])
  })
  it('records attempts, counts failures and resets them on success', () => {
    const clock = { value: 100 }
    const registry = createPollerRegistry(() => clock.value)
    const track = registry.tracker('clips')
    track.attempt()
    expect(registry.rows()[0]).toMatchObject({
      running: true,
      lastAttemptAt: 100,
    })
    clock.value = 400
    track.settle(false)
    track.scheduled(5000)
    expect(registry.rows()[0]).toMatchObject({
      running: false,
      failures: 1,
      lastSuccessAt: null,
      lastDurationMs: 300,
      nextAt: 5400,
    })
    clock.value = 5400
    track.attempt()
    expect(registry.rows()[0]?.nextAt).toBeNull()
    clock.value = 5500
    track.settle(true)
    expect(registry.rows()[0]).toMatchObject({
      failures: 0,
      lastSuccessAt: 5500,
    })
  })
  it('hands out copies', () => {
    const registry = createPollerRegistry()
    registry.tracker('atrium').attempt()
    const [copy] = registry.rows()
    if (copy !== undefined) copy.failures = 9
    expect(registry.rows()[0]?.failures).toBe(0)
  })
})
