import { describe, expect, it } from 'vitest'
import { observation as obs } from '../test/launchdObservation'
import { classifyBucket } from './classifyBucket'

const base = {
  covered: true,
  role: 'scheduled' as const,
  intervalMs: 3_600_000,
  inBucket: [],
  atEnd: null,
  runInBucket: false,
  missWindow: null,
}
const missed = { watched: true, ran: false }

describe('classifyBucket precedence', () => {
  it('ranks unknown over everything', () => {
    expect(
      classifyBucket({
        ...base,
        covered: false,
        inBucket: [obs(1, 1, 78)],
        atEnd: obs(1, 1, 78),
        runInBucket: true,
        missWindow: missed,
      }),
    ).toBe('unknown')
  })
  it('ranks failed over ok and missed', () => {
    expect(
      classifyBucket({ ...base, atEnd: obs(1, 2, 78), runInBucket: true }),
    ).toBe('failed')
    expect(
      classifyBucket({ ...base, atEnd: obs(1, 2, 78), missWindow: missed }),
    ).toBe('failed')
  })
  it('ranks ok over missed', () => {
    expect(
      classifyBucket({ ...base, runInBucket: true, missWindow: missed }),
    ).toBe('ok')
  })
  it('ranks missed over idle', () => {
    expect(classifyBucket({ ...base, missWindow: missed })).toBe('missed')
  })
  it('is idle when nothing happened', () => {
    expect(classifyBucket(base)).toBe('idle')
  })
})

describe('classifyBucket failures', () => {
  it('fails on a non-zero exit at the end of the bucket', () => {
    expect(classifyBucket({ ...base, atEnd: obs(1, 1, 78) })).toBe('failed')
  })
  it('fails on a non-zero exit recorded inside the bucket only', () => {
    expect(
      classifyBucket({
        ...base,
        inBucket: [obs(1, 1, 78)],
        atEnd: obs(2, 1, 0),
      }),
    ).toBe('failed')
  })
  it('does not fail on a missing exit code or exit zero', () => {
    expect(
      classifyBucket({
        ...base,
        inBucket: [obs(1, 1, null)],
        atEnd: obs(2, 1, 0),
      }),
    ).toBe('idle')
  })
  it('fails a keepalive job without a pid and passes one with a pid', () => {
    expect(
      classifyBucket({ ...base, role: 'keepalive', atEnd: obs(1, 1, 0, null) }),
    ).toBe('failed')
    expect(classifyBucket({ ...base, role: 'keepalive', atEnd: null })).toBe(
      'failed',
    )
    expect(
      classifyBucket({ ...base, role: 'keepalive', atEnd: obs(1, 1, 0, 42) }),
    ).toBe('ok')
  })
  it('fails a keepalive job with a pid but a non-zero exit', () => {
    expect(
      classifyBucket({ ...base, role: 'keepalive', atEnd: obs(1, 1, 78, 42) }),
    ).toBe('failed')
  })
  it('never calls a keepalive job missed or idle', () => {
    expect(
      classifyBucket({
        ...base,
        role: 'keepalive',
        atEnd: obs(1, 1, 0, 42),
        missWindow: missed,
      }),
    ).toBe('ok')
  })
})

describe('classifyBucket misses', () => {
  it('marks a miss only over a watched window with no run', () => {
    expect(
      classifyBucket({ ...base, missWindow: { watched: true, ran: true } }),
    ).toBe('idle')
    expect(
      classifyBucket({ ...base, missWindow: { watched: false, ran: false } }),
    ).toBe('idle')
    expect(classifyBucket({ ...base, intervalMs: null })).toBe('idle')
  })
  it('marks a run in the bucket as ok', () => {
    expect(
      classifyBucket({ ...base, runInBucket: true, atEnd: obs(1, 2, 0) }),
    ).toBe('ok')
  })
})
