import { type RefObject, useEffect, useRef } from 'react'

export const useFocusOnOpen = (
  open: boolean,
): RefObject<HTMLInputElement | null> => {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    ref.current?.focus()
    return () => {
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open])
  return ref
}
