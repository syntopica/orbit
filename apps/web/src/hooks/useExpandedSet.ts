import { useState } from 'react'

// Which rows of a list are open; each toggles on its own.
export const useExpandedSet = () => {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set())
  return {
    isOpen: (key: string) => open.has(key),
    toggle: (key: string) => {
      setOpen((current) => {
        const next = new Set(current)
        if (!next.delete(key)) next.add(key)
        return next
      })
    },
  }
}
