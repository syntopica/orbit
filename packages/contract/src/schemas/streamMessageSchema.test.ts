import { streamMessageSchema } from './streamMessageSchema'

const at = '2026-10-02T10:00:00.000Z'
const snapshot = {
  component: 'worker',
  health: { state: 'ok', reason: null },
  metrics: [],
  pending: [],
  events: [],
  observedAt: at,
  lastGood: null,
}
const event = {
  at,
  component: 'worker',
  kind: 'worker.job_failed',
  severity: 'warn',
  refs: { job: 'j1' },
}

describe('streamMessageSchema', () => {
  it('accepts sync and resync markers', () => {
    expect(streamMessageSchema.parse({ type: 'sync', id: 4 }).type).toBe('sync')
    expect(streamMessageSchema.parse({ type: 'resync', id: 0 }).type).toBe(
      'resync',
    )
  })
  it('accepts a snapshot message', () => {
    expect(
      streamMessageSchema.parse({ type: 'snapshot', id: 1, snapshot }),
    ).toEqual({ type: 'snapshot', id: 1, snapshot })
  })
  it('accepts an event message', () => {
    expect(streamMessageSchema.parse({ type: 'event', id: 2, event })).toEqual({
      type: 'event',
      id: 2,
      event,
    })
  })
  it('rejects a payload under the wrong type', () => {
    expect(() =>
      streamMessageSchema.parse({ type: 'event', id: 1, snapshot }),
    ).toThrow()
    expect(() =>
      streamMessageSchema.parse({ type: 'sync', id: 1, event }),
    ).toThrow()
  })
  it('rejects a fractional id', () => {
    expect(() =>
      streamMessageSchema.parse({ type: 'resync', id: 1.5 }),
    ).toThrow()
  })
  it('rejects a negative id', () => {
    expect(() => streamMessageSchema.parse({ type: 'sync', id: -1 })).toThrow()
  })
  it('rejects an unknown type', () => {
    expect(() => streamMessageSchema.parse({ type: 'page', id: 1 })).toThrow()
  })
})
