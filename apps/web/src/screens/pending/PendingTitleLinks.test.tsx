import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PendingTitleLinks } from './PendingTitleLinks'

describe('PendingTitleLinks', () => {
  it('links every address in the title', () => {
    render(<PendingTitleLinks title="mirror https://example.com/a failed" />)
    expect(
      screen.getByRole('link', { name: 'https://example.com/a' }),
    ).toHaveAttribute('href', 'https://example.com/a')
  })
  it('renders nothing for a title without one', () => {
    const { container } = render(<PendingTitleLinks title="plain" />)
    expect(container).toBeEmptyDOMElement()
  })
})
