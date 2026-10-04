import type { KeyboardEvent } from 'react'

export const trapConfirmTab = (
  event: KeyboardEvent<HTMLButtonElement>,
): void => {
  if (event.key !== 'Tab') return
  const buttons =
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      'button',
    )
  const first = buttons?.item(0)
  const last = buttons?.item(1)
  const wraps = event.shiftKey
    ? event.currentTarget === first
    : event.currentTarget === last
  if (!wraps) return
  event.preventDefault()
  ;(event.shiftKey ? last : first)?.focus()
}
