import { backlogHealth } from './backlogHealth'

describe('backlogHealth', () => {
  it('turns a healthy reading warn when the backlog is over', () => {
    expect(backlogHealth({ state: 'ok', reason: null }, true)).toEqual({
      state: 'warn',
      reason: 'backlog',
    })
    expect(backlogHealth({ state: 'ok', reason: null }, false)).toEqual({
      state: 'ok',
      reason: null,
    })
  })
  it('keeps a failed check its own reason', () => {
    const failed = { state: 'warn', reason: 'check_failed' } as const
    expect(backlogHealth(failed, true)).toBe(failed)
  })
})
