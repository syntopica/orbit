import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { trapTab } from './trapTab'

const renderTrap = (withButtons: boolean) =>
  render(
    <div role="toolbar" aria-label="trap" onKeyDown={trapTab}>
      {withButtons ? (
        <>
          <button type="button">one</button>
          <button type="button">two</button>
          <button type="button" tabIndex={-1}>
            skipped
          </button>
        </>
      ) : null}
    </div>,
  )

describe('trapTab', () => {
  it('wraps Tab from the last control to the first', () => {
    renderTrap(true)
    const [one, two] = screen.getAllByRole('button')
    two?.focus()
    expect(fireEvent.keyDown(two as HTMLElement, { key: 'Tab' })).toBe(false)
    expect(one).toHaveFocus()
  })
  it('wraps Shift-Tab from the first control to the last', () => {
    renderTrap(true)
    const [one, two] = screen.getAllByRole('button')
    one?.focus()
    expect(
      fireEvent.keyDown(one as HTMLElement, { key: 'Tab', shiftKey: true }),
    ).toBe(false)
    expect(two).toHaveFocus()
  })
  it('leaves Tab alone between controls and other keys alone', () => {
    renderTrap(true)
    const [one, two] = screen.getAllByRole('button')
    one?.focus()
    expect(fireEvent.keyDown(one as HTMLElement, { key: 'Tab' })).toBe(true)
    two?.focus()
    expect(
      fireEvent.keyDown(two as HTMLElement, { key: 'Tab', shiftKey: true }),
    ).toBe(true)
    expect(fireEvent.keyDown(two as HTMLElement, { key: 'a' })).toBe(true)
  })
  it('swallows Tab when nothing inside can take focus', () => {
    renderTrap(false)
    expect(fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'Tab' })).toBe(
      false,
    )
  })
})
