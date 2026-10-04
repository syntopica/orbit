import type { PendingView } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { formatStateCounts } from './formatStateCounts'

const item = (
  state: PendingView['items'][number]['state'],
): PendingView['items'][number] => ({
  id: state,
  source: 'todo:a',
  kind: 'todo',
  state,
  title: 't',
  detail: '',
  section: null,
  ref: 'x',
  ageMs: null,
})

describe('formatStateCounts', () => {
  it('summarises counts per state in triage order', () => {
    expect(
      formatStateCounts([item('open'), item('blocked'), item('open')]),
    ).toBe('1 blocked · 2 open')
  })
})
