import type { KeyboardEvent } from 'react'

export const trapTab = (event: KeyboardEvent<HTMLElement>): void => {
  if (event.key !== 'Tab') return
  const tabbables = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      'input:not([tabindex="-1"]), button:not([tabindex="-1"]), a[href]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
    ),
  ]
  const first = tabbables.at(0)
  const last = tabbables.at(-1)
  if (first === undefined || last === undefined) {
    event.preventDefault()
    return
  }
  const edge = event.shiftKey ? first : last
  if (document.activeElement !== edge) return
  event.preventDefault()
  ;(event.shiftKey ? last : first).focus()
}
