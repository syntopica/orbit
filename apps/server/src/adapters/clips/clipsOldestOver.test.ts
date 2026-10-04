import { clipsOldestOver } from './clipsOldestOver'

const now = new Date('2026-10-04T12:00:00Z')
const row = (oldestAt: string | null) => ({
  key: 'clips.pending' as const,
  count: 3,
  oldestAt,
})

describe('clipsOldestOver', () => {
  it('compares the oldest waiting clip with the limit in days', () => {
    expect(clipsOldestOver([row('2026-07-26T12:00:00Z')], 70, now)).toBe(false)
    expect(clipsOldestOver([row('2026-07-26T11:59:59Z')], 70, now)).toBe(true)
  })
  it('never warns without a limit or an oldest date', () => {
    expect(clipsOldestOver([row('2020-01-01T00:00:00Z')], undefined, now)).toBe(
      false,
    )
    expect(clipsOldestOver([row(null)], 1, now)).toBe(false)
  })
})
