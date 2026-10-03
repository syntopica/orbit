import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FlowEdge } from './FlowEdge'

vi.mock('@xyflow/react', () => ({
  BaseEdge: () => null,
  getBezierPath: () => ['M0,0 L10,10', 5, 5],
}))

const MOTION_ID = 'flow-motion'

const edge = (durationS: number | null, perHour: number | null) => (
  <svg>
    <FlowEdge
      id="archive>synthesis"
      source="archive"
      target="synthesis"
      sourceX={0}
      sourceY={0}
      targetX={10}
      targetY={10}
      sourcePosition={'right' as never}
      targetPosition={'left' as never}
      data={{ perHour, durationS }}
    />
  </svg>
)

describe('FlowEdge', () => {
  it('moves one particle per measured interval and labels the rate', () => {
    render(edge(2.5, 24))
    expect(screen.queryByTestId(MOTION_ID)).toHaveAttribute('dur', '2.5s')
    expect(screen.getByText('24/h')).toBeInTheDocument()
  })
  it('draws no particle without a flowing rate', () => {
    render(edge(null, null))
    expect(screen.queryByTestId(MOTION_ID)).toBeNull()
    expect(screen.queryByText(/\/h/u)).toBeNull()
  })
  it('removes motion when animation is disabled and keeps the measured rate', () => {
    const { rerender } = render(edge(2.5, 24))
    expect(screen.getByTestId(MOTION_ID)).toHaveAttribute(
      'repeatCount',
      'indefinite',
    )
    rerender(edge(null, 24))
    expect(screen.queryByTestId(MOTION_ID)).toBeNull()
    expect(screen.getByText('24/h')).toBeInTheDocument()
  })
})
