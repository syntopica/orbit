import { toFailureRows } from './toFailureRows'

const failure = (id: string, finished: number | null, error = 'timeout') => ({
  id,
  queue: 'queue.a',
  error,
  finished,
})

describe('toFailureRows', () => {
  it('orders failures newest first, undated last, and drops unsafe rows', () => {
    expect(
      toFailureRows([
        failure('undated', null),
        failure('older', 1.5, 'free text error'),
        failure('newer', 2),
        failure('bad id', 3),
        { ...failure('ok', 3), queue: 'bad queue' },
      ]),
    ).toEqual([
      { id: 'newer', queue: 'queue.a', error: 'timeout', finishedAt: 2000 },
      { id: 'older', queue: 'queue.a', error: null, finishedAt: 1500 },
      { id: 'undated', queue: 'queue.a', error: 'timeout', finishedAt: null },
    ])
  })
  it('keeps the newest 50', () => {
    const many = Array.from({ length: 60 }, (_, i) =>
      failure(`job${String(i).padStart(2, '0')}`, i),
    )
    const capped = toFailureRows(many)
    expect(capped).toHaveLength(50)
    expect(capped[0]?.id).toBe('job59')
    expect(capped[49]?.id).toBe('job10')
  })
  it('breaks time ties by id', () => {
    const rows = toFailureRows([
      failure('b', 1),
      failure('a', 1),
      failure('d', null),
      failure('c', null),
    ])
    expect(rows.map((f) => f.id)).toEqual(['a', 'b', 'c', 'd'])
  })
})
