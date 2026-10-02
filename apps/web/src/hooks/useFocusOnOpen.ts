import { type RefObject, useEffect, useRef } from 'react'

export const useFocusOnOpen = (
  open: boolean,
): RefObject<HTMLInputElement | null> => {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])
  return ref
}
