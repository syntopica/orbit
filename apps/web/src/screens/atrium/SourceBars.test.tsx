import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SourceBars } from './SourceBars'

describe('SourceBars', () => {
  it('keeps a 128-character source readable without forcing the count outside its row', () => {
    const source = 'source'.padEnd(128, 'x')
    render(
      <SourceBars records={{ total: 30, bySource: [{ source, count: 30 }] }} />,
    )
    const region = screen.getByRole('region', { name: 'Records per source' })
    const label = within(region).getByText(source)
    expect(region).toHaveClass('min-w-0')
    expect(label).toHaveClass('min-w-0', 'break-all')
    expect(within(region).getByText('30')).toHaveClass('shrink-0')
  })
})
