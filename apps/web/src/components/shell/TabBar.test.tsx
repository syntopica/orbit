import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { renderShell } from '../../test/renderShell'

describe('phone navigation', () => {
  it('shows five icon and label slots, with the sheet route active', async () => {
    const { container } = await renderShell('/system')
    const tabs = screen.getByRole('navigation', { name: 'Tabs' })
    expect(within(tabs).getAllByRole('link')).toHaveLength(4)
    expect(within(tabs).getAllByRole('img', { hidden: true })).toHaveLength(5)
    const more = within(tabs).getByRole('button', { name: 'More' })
    expect(more).toHaveAttribute('aria-current', 'page')
    expect(
      within(tabs)
        .getAllByRole('link')
        .every((link) => !link.hasAttribute('aria-current')),
    ).toBe(true)
    fireEvent.click(more)
    const sheet = screen.getByRole('dialog', { name: 'More screens' })
    expect(sheet).toBeInTheDocument()
    expect(within(sheet).getByRole('link', { name: 'System' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0)
  })

  it('traps focus and returns it to More after Escape or backdrop tap', async () => {
    await renderShell()
    const more = screen.getByRole('button', { name: 'More' })
    fireEvent.click(more)
    const sheet = screen.getByRole('dialog', { name: 'More screens' })
    const first = within(sheet).getByRole('link', { name: 'Atrium' })
    expect(first).toHaveFocus()
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    const last = within(sheet).getByRole('link', { name: 'System' })
    expect(last).toHaveFocus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()
    fireEvent.keyDown(first, {
      key: 'Escape',
    })
    await waitFor(() => expect(more).toHaveFocus())
    fireEvent.click(more)
    fireEvent.click(screen.getByRole('button', { name: 'Close more screens' }))
    await waitFor(() => expect(more).toHaveFocus())
  })
})
