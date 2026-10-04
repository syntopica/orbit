import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HeartbeatLegend } from './HeartbeatLegend'

describe('HeartbeatLegend', () => {
  it('names every bar colour and what one bar covers', () => {
    render(<HeartbeatLegend range="24h" />)
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['ran', 'failed', 'missed', 'idle', 'not observed'])
    expect(
      screen.getByText(
        'One bar per 30m; oldest on the left, now on the right.',
      ),
    ).toBeInTheDocument()
  })
})
