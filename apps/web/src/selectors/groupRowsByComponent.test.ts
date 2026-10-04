import { describe, expect, it } from 'vitest'

import type { LaunchdRow } from '../types/LaunchdRow'
import { groupRowsByComponent } from './groupRowsByComponent'

const row = (label: string, component: string) =>
  ({ label, component }) as LaunchdRow

describe('groupRowsByComponent', () => {
  it('groups rows by component in first-seen order', () => {
    const groups = groupRowsByComponent([
      row('a', 'worker'),
      row('b', 'atrium'),
      row('c', 'worker'),
    ])
    expect(
      groups.map((group) => [group.component, group.rows.map((r) => r.label)]),
    ).toEqual([
      ['worker', ['a', 'c']],
      ['atrium', ['b']],
    ])
  })
})
