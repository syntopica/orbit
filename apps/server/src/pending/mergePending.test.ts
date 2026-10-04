import type { PendingView } from '@orbit/contract'

import { mergePending } from './mergePending'

describe('mergePending', () => {
  it('orders blocked before partial and caps items at 2000', () => {
    const item: PendingView['items'][number] = {
      id: 'a',
      source: 'todo:a',
      kind: 'todo',
      state: 'open',
      title: 'A',
      detail: '',
      section: null,
      ref: { file: '/tmp/a', line: 1 },
      ageMs: null,
    }
    const source = {
      id: 'todo:a',
      kind: 'todo' as const,
      name: 'a',
      status: 'ok' as const,
      count: 2003,
    }
    const result = mergePending(
      [
        {
          source,
          items: [
            item,
            ...Array.from({ length: 2000 }, (_, i) => ({
              ...item,
              id: String(i),
            })),
            { ...item, id: 'blocked', state: 'blocked' },
            { ...item, id: 'partial', state: 'partial' },
          ],
        },
      ],
      1,
    )
    expect(result.items).toHaveLength(2000)
    expect(result.items[0]?.id).toBe('blocked')
    expect(result.items[1]?.id).toBe('partial')
  })
})
