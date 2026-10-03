import { workerHealth } from './workerHealth'
import { WORKER_LAG_LIMIT_S } from './workerLagLimit'

describe('workerHealth', () => {
  it('stays ok while the oldest queued job is within a day', () => {
    expect(workerHealth(0)).toEqual({ state: 'ok', reason: null })
    expect(workerHealth(WORKER_LAG_LIMIT_S)).toEqual({
      state: 'ok',
      reason: null,
    })
  })
  it('warns lagging once a job has waited longer than a day', () => {
    expect(workerHealth(WORKER_LAG_LIMIT_S + 1)).toEqual({
      state: 'warn',
      reason: 'lagging',
    })
  })
})
