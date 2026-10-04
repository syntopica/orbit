import { useEffect, useRef, type RefObject } from 'react'

export const useMoreSheetFocus = (
  trigger: RefObject<HTMLButtonElement | null>,
) => {
  const first = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const button = trigger.current
    first.current?.focus()
    return () => button?.focus()
  }, [trigger])
  return first
}
