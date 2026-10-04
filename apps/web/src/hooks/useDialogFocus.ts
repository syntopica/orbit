import { useEffect, useRef } from 'react'

export const useDialogFocus = () => {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement
    ref.current?.focus()
    return () => {
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])
  return ref
}
