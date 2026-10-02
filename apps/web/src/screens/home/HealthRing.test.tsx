import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HealthRing } from './HealthRing'

describe('HealthRing', () => {
  it.each([
    [true, '0.5'],
    [false, '1'],
  ])('greyed=%s draws at opacity %s', (greyed, opacity) => {
    render(
      <svg>
        <HealthRing state="down" greyed={greyed} />
      </svg>,
    )
    expect(screen.getByTestId('ring')).toHaveAttribute('opacity', opacity)
  })
})
