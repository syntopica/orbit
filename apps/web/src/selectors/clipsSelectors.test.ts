import type { ClipsView } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { selectFunnel } from './selectFunnel'
import { selectIntakeColumns } from './selectIntakeColumns'

const view: ClipsView = {
  now: 1_790_000_000_000,
  total: 13,
  states: [
    { state: 'pending', count: 3, oldestAt: null },
    { state: 'needs-claude', count: 1, oldestAt: null },
    { state: 'synthesized', count: 1, oldestAt: null },
    { state: 'reconciliation-pending', count: 2, oldestAt: null },
    { state: 'reconciled', count: 4, oldestAt: null },
    { state: 'unreadable', count: 1, oldestAt: null },
    { state: 'archived', count: 1, oldestAt: null },
  ],
  intake: { days: [{ day: '2026-10-02', count: 2 }], undated: 0 },
  doctor: { ok: true, checks: [] },
  capture: null,
  items: null,
}

describe('selectFunnel', () => {
  it('includes all reconciliation and broken states while keeping unknown identifiers', () => {
    const rows = selectFunnel({
      ...view,
      states: [
        { state: 'locally-stale', count: 2, oldestAt: null },
        { state: 'inconsistent', count: 4, oldestAt: null },
        { state: 'custom-state', count: 7, oldestAt: null },
      ],
    })
    expect(rows.find((row) => row.id === 'reconciling')?.count).toBe(2)
    expect(rows.find((row) => row.id === 'broken')).toMatchObject({
      count: 4,
      broken: true,
    })
    expect(rows.at(-1)).toEqual({
      id: 'custom-state',
      label: 'custom-state',
      count: 7,
      broken: false,
    })
  })
  it('groups states in funnel order and lists unknown states after', () => {
    expect(selectFunnel(view)).toEqual([
      { id: 'pending', label: 'pending', count: 3, broken: false },
      { id: 'review', label: 'need review', count: 1, broken: false },
      {
        id: 'reconciling',
        label: 'in reconciliation',
        count: 3,
        broken: false,
      },
      { id: 'reconciled', label: 'reconciled', count: 4, broken: false },
      { id: 'broken', label: 'broken', count: 1, broken: true },
      { id: 'archived', label: 'archived', count: 1, broken: false },
    ])
  })
})

describe('selectIntakeColumns', () => {
  it('makes one UTC day column per intake day', () => {
    const start = Date.parse('2026-10-02T00:00:00Z')
    expect(selectIntakeColumns(view.intake)).toEqual([
      {
        start,
        end: start + 86_400_000,
        segments: [{ key: 'captured', count: 2 }],
        total: 2,
      },
    ])
  })
})
