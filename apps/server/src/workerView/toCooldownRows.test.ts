import { toCooldownRows } from './toCooldownRows'

const NOW = 1_790_000_000_000

describe('toCooldownRows', () => {
  it('turns cooldowns into availability times, longest wait first', () => {
    const rows = toCooldownRows(
      { 'runner-b': 60, 'runner-c': 3600, 'runner-a': 60, 'x y': 9e9 },
      NOW,
    )
    expect(rows).toEqual([
      { runner: 'runner-c', availableAt: NOW + 3_600_000 },
      { runner: 'runner-a', availableAt: NOW + 60_000 },
      { runner: 'runner-b', availableAt: NOW + 60_000 },
    ])
  })
})
